const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Auto-create users table on connection
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'donor',
      phone TEXT,
      location TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table', err.message);
      } else {
        console.log('Users table initialized.');
        // Add columns in case the table already existed without them
        db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
        db.run(`ALTER TABLE users ADD COLUMN location TEXT`, () => {});
        db.run(`ALTER TABLE users ADD COLUMN description TEXT`, () => {});
      }
    });

    // Auto-create food listings table
    db.run(`CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      donor_name TEXT NOT NULL,
      title TEXT NOT NULL,
      qty TEXT NOT NULL,
      expiry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ngo_id INTEGER,
      FOREIGN KEY (donor_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating listings table', err.message);
      } else {
        console.log('Listings table initialized.');
        db.run(`ALTER TABLE listings ADD COLUMN ngo_id INTEGER`, () => {});
      }
    });
  }
});

module.exports = db;
