const express = require('express');
const app = express();
const booksRoutes = require('./src/routes/books');

app.use(express.json());

// Mount the books router
app.use('/api', booksRoutes);

app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.listen(3000, () => {
  console.log('Szerver fut a 3000-es porton');
});

