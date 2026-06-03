const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [admins] = await db.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = admins[0];

    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login
};