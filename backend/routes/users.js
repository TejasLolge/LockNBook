const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import the database pool

// GET /api/users
router.get('/', async (req, res) => {
  try {
    // Query the database
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'User route is active!', 
      databaseTime: result.rows[0].now 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

module.exports = router;
