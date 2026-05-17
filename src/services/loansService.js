const AppDataSource = require('../config/data-source');
const LoanEntity = require('../entities/Loan');
const BookEntity = require('../entities/Book');

const getLoanRepo = () => AppDataSource.getRepository(LoanEntity);

exports.borrow = async (userId, bookId, loanDays = 14) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const book = await queryRunner.manager.findOne(BookEntity, {
      where: { id: bookId },
      lock: { mode: 'pessimistic_write' }
    });

    if (!book) throw new Error('Book not found');
    if (!book.available) throw new Error('Book not available');

    const dueDate = new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000);
    const loan = queryRunner.manager.create('Loan', {
      user_id: userId,
      book_id: bookId,
      borrowed_at: new Date(),
      due_date: dueDate,
      status: 'active'
    });

    const savedLoan = await queryRunner.manager.save('Loan', loan);

    await queryRunner.manager.update(BookEntity, bookId, { available: false });

    await queryRunner.commitTransaction();

    return {
      insertId: savedLoan.id,
      due_date: dueDate.toISOString().slice(0, 19).replace('T', ' '),
      book_status: 'loaned'
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

exports.return = async (loanId, userId = null) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const loan = await queryRunner.manager.findOne(LoanEntity, {
      where: { id: loanId },
      lock: { mode: 'pessimistic_write' }
    });

    if (!loan) throw new Error('Loan not found');
    if (userId && loan.user_id !== userId) throw new Error('Not authorized to return this loan');
    if (loan.returned_at) throw new Error('Already returned');

    const now = new Date();
    await queryRunner.manager.update(LoanEntity, loanId, {
      returned_at: now,
      status: 'returned'
    });

    await queryRunner.manager.update(BookEntity, loan.book_id, { available: true });

    await queryRunner.commitTransaction();

    const daysOverdue = Math.max(0, Math.ceil((now - loan.due_date) / (1000 * 60 * 60 * 24)));

    return {
      id: loanId,
      returned_at: now,
      due_date: loan.due_date,
      overdue_days: daysOverdue
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

exports.getByUser = async (userId, status = null, page = 1, size = 50) => {
  const offset = (page - 1) * size;
  const where = { user_id: userId };
  if (status) {
    where.status = status;
  }

  const [items, total] = await getLoanRepo().findAndCount({
    where,
    relations: ['book'],
    order: { borrowed_at: 'DESC' },
    take: size,
    skip: offset
  });

  return {
    items: items.map(loan => ({
      id: loan.id,
      book_id: loan.book_id,
      title: loan.book.title,
      borrowed_at: loan.borrowed_at,
      due_date: loan.due_date,
      returned_at: loan.returned_at,
      status: loan.status
    })),
    total
  };
};

exports.listAll = async (page = 1, size = 100) => {

  const offset = (page - 1) * size;

  const [items, total] = await getLoanRepo().findAndCount({
    where: { status: 'active' },
    relations: ['book', 'user'],
    order: { borrowed_at: 'DESC' },
    take: size,
    skip: offset
  });


  return {
    items: items.map(loan => ({
      id: loan.id,
      user_id: loan.user_id,
      user_email: loan.user ? loan.user.email : 'Unknown',
      book_id: loan.book_id,
      title: loan.book.title, 
      borrowed_at: loan.borrowed_at,
      due_date: loan.due_date,
      returned_at: loan.returned_at,
      status: loan.status
    })),
    total
  };
};
