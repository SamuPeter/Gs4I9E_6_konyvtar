const AppDataSource = require('../config/data-source');
const BookEntity = require('../entities/Book');

const getBookRepo = () => AppDataSource.getRepository(BookEntity);

exports.list = async (filter = {}) => {
  const query = getBookRepo().createQueryBuilder('b')
    .select(['b.id', 'b.title', 'b.author', 'b.description', 'b.available', 'b.created_at']);

  if (filter.search) {
    query.andWhere('(b.title LIKE :search OR b.author LIKE :search)', {
      search: `%${filter.search}%`
    });
  }

  if (filter.available) {
    query.andWhere('b.available = true');
  }

  return await query.orderBy('b.title', 'ASC').getMany();
};

exports.getById = async (id) => {
  return await getBookRepo().findOne({
    where: { id },
    select: ['id', 'title', 'author', 'description', 'available', 'created_at']
  });
};

exports.create = async (data) => {
  const repo = getBookRepo();
  const book = repo.create({
    title: data.title,
    author: data.author,
    description: data.description || null,
    available: data.available !== false
  });
  const result = await repo.save(book);
  return { insertId: result.id };
};

exports.update = async (id, data) => {
  await getBookRepo().update(id, {
    title: data.title,
    author: data.author,
    description: data.description || null,
    available: data.available !== false
  });
};

exports.delete = async (id) => {
  await getBookRepo().delete(id);
};
