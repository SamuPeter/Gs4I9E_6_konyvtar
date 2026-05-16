require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const loansRouter = require('./routes/loans');
const usersRouter = require('./routes/users');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
app.use(express.json());

app.use('/api/v1', authRouter);
app.use('/api/v1', booksRouter);
app.use('/api/v1', loansRouter);
app.use('/api/v1', usersRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));