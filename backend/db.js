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
        db.serialize(() => {
          db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN location TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN description TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN profile_image TEXT`, () => {});
        });
      }
    });

    // Auto-create food listings table
    db.run(`CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      donor_name TEXT NOT NULL,
      title TEXT NOT NULL,
      qty REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      original_qty REAL NOT NULL,
      available_qty REAL NOT NULL,
      expiry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ngo_id INTEGER,
      FOREIGN KEY (donor_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating listings table', err.message);
      } else {
        console.log('Listings table initialized.');
        // Add columns in case the table already existed without them
        db.serialize(() => {
          db.run(`ALTER TABLE listings ADD COLUMN ngo_id INTEGER`, () => {});
          db.run(`ALTER TABLE listings ADD COLUMN unit TEXT DEFAULT 'kg'`, () => {});
          db.run(`ALTER TABLE listings ADD COLUMN original_qty REAL`, () => {});
          db.run(`ALTER TABLE listings ADD COLUMN available_qty REAL`, () => {});
          db.run(`ALTER TABLE listings ADD COLUMN image TEXT`, () => {});
        });
      }
    });

    // Auto-create claims table
    db.run(`CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      ngo_id INTEGER NOT NULL,
      ngo_name TEXT NOT NULL,
      claimed_qty REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Claimed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings (id),
      FOREIGN KEY (ngo_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating claims table', err.message);
      } else {
        console.log('Claims table initialized.');
      }
    });
  }
});

module.exports = db;
