const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppDataSource = require('../config/data-source');
const UserEntity = require('../entities/User');

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const getUserRepo = () => AppDataSource.getRepository(UserEntity);

exports.register = async (email, password) => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const repo = getUserRepo();
  const user = repo.create({ email, password: hashed });
  const result = await repo.save(user);
  return { insertId: result.id };
};

exports.login = async (email, password) => {
  const user = await getUserRepo().findOne({
    where: { email },
    select: ['id', 'email', 'password', 'role']
  });

  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
};
