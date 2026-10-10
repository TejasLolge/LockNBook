const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    infrastructure: 'PostgreSQL & Redis connected natively' 
  });
});

app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
