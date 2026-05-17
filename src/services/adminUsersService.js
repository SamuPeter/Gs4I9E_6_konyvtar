const AppDataSource = require('../config/data-source');
const UserEntity = require('../entities/User');
const bcrypt = require('bcrypt');

const getUserRepo = () => AppDataSource.getRepository(UserEntity);

exports.listUsers = async (query = '', role = null, isActive = null, limit = 20, offset = 0) => {
  const qb = getUserRepo().createQueryBuilder('u')
    .select(['u.id', 'u.email', 'u.role', 'u.is_active', 'u.created_at']);

  if (query) {
    qb.andWhere('u.email LIKE :query', { query: `%${query}%` });
  }
  if (role) {
    qb.andWhere('u.role = :role', { role });
  }
  if (isActive !== null) {
    qb.andWhere('u.is_active = :isActive', { isActive });
  }

  return await qb
    .orderBy('u.created_at', 'DESC')
    .take(parseInt(limit))
    .skip(parseInt(offset))
    .getMany();
};

exports.getUserCount = async (query = '', role = null, isActive = null) => {
  const qb = getUserRepo().createQueryBuilder('u');

  if (query) {
    qb.andWhere('u.email LIKE :query', { query: `%${query}%` });
  }
  if (role) {
    qb.andWhere('u.role = :role', { role });
  }
  if (isActive !== null) {
    qb.andWhere('u.is_active = :isActive', { isActive });
  }

  return await qb.getCount();
};

exports.getUserById = async (id) => {
  return await getUserRepo().findOne({
    where: { id },
    select: ['id', 'email', 'role', 'is_active', 'created_at']
  });
};

exports.updateUser = async (id, updates) => {
  const allowedFields = ['email', 'role', 'is_active'];
  const updateData = {};

  for (const field of allowedFields) {
    if (field in updates) {
      updateData[field] = updates[field];
    }
  }

  if (Object.keys(updateData).length === 0) return false;

  const result = await getUserRepo().update(id, updateData);
  return result.affected > 0;
};

exports.resetPassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await getUserRepo().update(id, { password: hashedPassword });
  return result.affected > 0;
};

exports.deactivateUser = async (id) => {
  const result = await getUserRepo().update(id, { is_active: false });
  return result.affected > 0;
};
