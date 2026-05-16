require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const loansRouter = require('./routes/loans');

const app = express();
app.use(express.json());

app.use('/api/v1', authRouter);
app.use('/api/v1', booksRouter);
app.use('/api/v1', loansRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
