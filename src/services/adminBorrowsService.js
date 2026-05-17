const AppDataSource = require('../config/data-source');
const LoanEntity = require('../entities/Loan');

const getLoanRepo = () => AppDataSource.getRepository(LoanEntity);

exports.searchBorrows = async (userQuery = '', itemQuery = '', status = null, fromDate = null, toDate = null, limit = 20, offset = 0) => {
  const query = getLoanRepo().createQueryBuilder('l')
    .leftJoinAndSelect('l.user', 'u')
    .leftJoinAndSelect('l.book', 'b')
    .select([
      'l.id',
      'l.user_id',
      'l.book_id',
      'l.borrowed_at',
      'l.due_date',
      'l.returned_at',
      'l.status',
      'u.email',
      'b.title'
    ]);

  if (userQuery) {
    query.andWhere('u.email LIKE :userQuery', { userQuery: `%${userQuery}%` });
  }
  if (itemQuery) {
    query.andWhere('b.title LIKE :itemQuery', { itemQuery: `%${itemQuery}%` });
  }
  if (status !== null && status !== undefined) {
    query.andWhere('l.status = :status', { status });
  }
  if (fromDate) {
    query.andWhere('l.borrowed_at >= :fromDate', { fromDate });
  }
  if (toDate) {
    query.andWhere('l.borrowed_at <= :toDate', { toDate });
  }

  const rows = await query
    .orderBy('l.borrowed_at', 'DESC')
    .take(parseInt(limit))
    .skip(parseInt(offset))
    .getRawMany();

  return rows.map(row => ({
    id: row.l_id,
    user_id: row.l_user_id,
    book_id: row.l_book_id,
    borrowed_at: row.l_borrowed_at,
    due_date: row.l_due_date,
    returned_at: row.l_returned_at,
    status: row.l_status,
    user_email: row.u_email,
    book_title: row.b_title
  }));
};

exports.getBorrowCount = async (userQuery = '', itemQuery = '', status = null, fromDate = null, toDate = null) => {
  const query = getLoanRepo().createQueryBuilder('l')
    .leftJoin('l.user', 'u')
    .leftJoin('l.book', 'b');

  if (userQuery) {
    query.andWhere('u.email LIKE :userQuery', { userQuery: `%${userQuery}%` });
  }
  if (itemQuery) {
    query.andWhere('b.title LIKE :itemQuery', { itemQuery: `%${itemQuery}%` });
  }
  if (status) {
    query.andWhere('l.status = :status', { status });
  }
  if (fromDate) {
    query.andWhere('l.borrowed_at >= :fromDate', { fromDate });
  }
  if (toDate) {
    query.andWhere('l.borrowed_at <= :toDate', { toDate });
  }

  return await query.getCount();
};

exports.getBorrowById = async (id) => {
  const loan = await getLoanRepo().createQueryBuilder('l')
    .leftJoinAndSelect('l.user', 'u')
    .leftJoinAndSelect('l.book', 'b')
    .where('l.id = :id', { id })
    .getOne();

  if (!loan) return undefined;

  return {
    id: loan.id,
    user_id: loan.user_id,
    book_id: loan.book_id,
    borrowed_at: loan.borrowed_at,
    due_date: loan.due_date,
    returned_at: loan.returned_at,
    status: loan.status,
    user_email: loan.user?.email,
    user_id_detail: loan.user?.id,
    book_title: loan.book?.title,
    book_id_detail: loan.book?.id
  };
};

exports.updateBorrowDueDate = async (borrowId, newDueDate) => {
  const result = await getLoanRepo().update(borrowId, { due_date: newDueDate });
  return result.affected > 0;
};

exports.markBorrowReturned = async (borrowId) => {
  const result = await getLoanRepo().update(borrowId, {
    status: 'returned',
    returned_at: new Date()
  });
  return result.affected > 0;
};
