const mysql = require('mysql');
const { promisify } = require('util');

const connection = mysql.createConnection({
  host: process.env.DB_HOSTNAME || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME_DATABASE || 'notes_app',
  port: process.env.PORT,
  connectionLimit: 50,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

connection.query = promisify(connection.query);

module.exports = connection;
