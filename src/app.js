require('dotenv').config();
const express = require('express');
const path = require('path');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const loansRouter = require('./routes/loans');
const usersRouter = require('./routes/users');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
app.use(express.json());

// API routes
app.use('/api/v1', authRouter);
app.use('/api/v1', booksRouter);
app.use('/api/v1', loansRouter);
app.use('/api/v1', usersRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static UI files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.get('/books', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'books.html')));
app.get('/books/:id', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'book-details.html')));
app.get('/auth/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'auth', 'login.html')));
app.get('/auth/register', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'auth', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'index.html')));
app.get('/admin/books', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'books.html')));
app.get('/admin/loans', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'loans.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));