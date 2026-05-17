const AppDataSource = require('../config/data-source');
const UserEntity = require('../entities/User');

const getUserRepo = () => AppDataSource.getRepository(UserEntity);

exports.getById = async (id) => {
  return await getUserRepo().findOne({
    where: { id },
    select: ['id', 'email', 'role', 'created_at']
  });
};
