const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test connection on startup and provide clear debugging info
pool.connect((err, client, release) => {
    if (err) {
        console.error('\n========================================');
        console.error('❌ DATABASE CONNECTION ERROR');
        console.error('========================================');
        console.error(`Host:     ${process.env.DB_HOST || 'localhost'}`);
        console.error(`Port:     ${process.env.DB_PORT || 5432}`);
        console.error(`Database: ${process.env.DB_NAME}`);
        console.error(`User:     ${process.env.DB_USER}`);
        console.error('----------------------------------------');
        console.error('Please ensure that:');
        console.error('1. PostgreSQL service is actively running.');
        console.error('2. Your .env file has the correct DB credentials.');
        console.error('3. The database server is accepting connections.');
        console.error('----------------------------------------');
        console.error('Error Details:', err.message);
        console.error('========================================\n');
    } else {
        console.log('\n----------------------------------------');
        console.log(`✅ Successfully connected to database: ${process.env.DB_NAME}`);
        console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'} | 🔌 Port: ${process.env.DB_PORT || 5432}`);
        console.log('----------------------------------------\n');
        release();
    }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err.message);
    process.exit(-1);
});

module.exports = {
    query: async (text, params) => {
        console.log(`\n[DB QUERY EXECUTING]: ${text}`);
        if (params && params.length > 0) {
            console.log(`[DB PARAMS]:`, params);
        }
        try {
            const start = Date.now();
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`[DB QUERY SUCCESS]: Executed in ${duration}ms, returned ${res.rowCount} rows`);
            return res;
        } catch (error) {
            console.error(`[DB QUERY ERROR]: Failed executing query: ${error.message}`);
            throw error; // Re-throw so controllers handle the error gracefully
        }
    },
};
