require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const User = require('../entities/User');
const Book = require('../entities/Book');
const Loan = require('../entities/Loan');
const AdminAuditLog = require('../entities/AdminAuditLog');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Book, Loan, AdminAuditLog]
});

module.exports = AppDataSource;
