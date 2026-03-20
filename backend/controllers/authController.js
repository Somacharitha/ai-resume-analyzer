const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Incoming signup request for email:', email);

        // Check if user exists
        let existingUser;
        try {
            existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            console.log('Existing user query result:', existingUser.rows);
            
            if (existingUser && existingUser.rows && existingUser.rows.length > 0) {
                return res.status(400).json({ message: 'User already exists. Please login.' });
            }
        } catch (dbError) {
            console.error('\n[SIGNUP DB ERROR]: Failed during user check =', dbError.message);
            if (dbError.code === 'ECONNREFUSED') {
                console.error('[SIGNUP DB ERROR]: Hint - PostgreSQL server is down or unreachable.');
            }
            return res.status(500).json({ message: 'Service Unavailable: Database connection failed. Please ensure the database is running.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        let newUser;
        try {
            newUser = await db.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
                [name, email, hashedPassword]
            );
        } catch (dbError) {
            console.error('\n[SIGNUP DB ERROR]: Failed during user insertion =', dbError.message);
            if (dbError.code === 'ECONNREFUSED') {
                console.error('[SIGNUP DB ERROR]: Hint - PostgreSQL server is down or unreachable.');
            }
            return res.status(500).json({ message: 'Service Unavailable: Database connection failed while creating user.' });
        }

        res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
