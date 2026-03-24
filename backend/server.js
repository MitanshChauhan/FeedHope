const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://feed-hope-ten.vercel.app/"
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// WebSocket Connection Logging
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io available inside route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Endpoint: Register a new user
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role, phone, location, description } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password, role, phone, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, email, hashedPassword, role, phone || null, location || null, description || null], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Database error.', details: err.message });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
});

// API Endpoint: Login User
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.', details: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Don't send the password hash back to the client
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful.', user: userWithoutPassword });
  });
});

// ==========================================
// REAL-TIME LISTINGS API
// ==========================================

// Get all available listings (For NGOs)
app.get('/api/listings', (req, res) => {
  const sql = `SELECT * FROM listings WHERE status = 'Available' ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get listings for a specific donor
app.get('/api/listings/user/:id', (req, res) => {
  const sql = `SELECT * FROM listings WHERE donor_id = ? ORDER BY created_at DESC`;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get active claims for a specific NGO
app.get('/api/listings/ngo/:id', (req, res) => {
  const sql = `SELECT * FROM listings WHERE ngo_id = ? AND status IN ('Claimed', 'Picked Up', 'Completed') ORDER BY created_at DESC`;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new listing (For Donors)
app.post('/api/listings', (req, res) => {
  const { donor_id, donor_name, title, qty, expiry } = req.body;
  if (!donor_id || !title || !qty) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `INSERT INTO listings (donor_id, donor_name, title, qty, expiry) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [donor_id, donor_name, title, qty, expiry || 'End of day'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch the newly created listing to broadcast it
    db.get('SELECT * FROM listings WHERE id = ?', [this.lastID], (err, newListing) => {
      if (!err && newListing) {
        // BROADCAST EVENT TO ALL CLIENTS
        req.io.emit('new_listing', newListing);
      }
      res.status(201).json({ message: 'Listing created', id: this.lastID, listing: newListing });
    });
  });
});

// Claim a listing (For NGOs)
app.put('/api/listings/:id/claim', (req, res) => {
  const { id } = req.params;
  const { ngo_id } = req.body;
  const sql = `UPDATE listings SET status = 'Claimed', ngo_id = ? WHERE id = ?`;
  
  db.run(sql, [ngo_id || null, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // BROADCAST EVENT TO ALL CLIENTS
    req.io.emit('listing_claimed', id);
    res.json({ message: 'Listing claimed successfully' });
  });
});

// Mark listing as Picked Up (For NGOs)
app.put('/api/listings/:id/pickup', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE listings SET status = 'Picked Up' WHERE id = ?`;
  
  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    req.io.emit('listing_pickedup', id);
    res.json({ message: 'Listing marked as picked up' });
  });
});

// Mark listing as Completed (For NGOs)
app.put('/api/listings/:id/complete', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE listings SET status = 'Completed' WHERE id = ?`;
  
  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    req.io.emit('listing_completed', id);
    res.json({ message: 'Listing marked as completed' });
  });
});

// ==========================================
// USER PROFILES API
// ==========================================

// Get Top Donors
app.get('/api/donors/top', (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.location, COUNT(l.id) as totalDonations, COALESCE(SUM(CAST(l.qty AS INTEGER)), 0) as mealsProvided
    FROM users u
    LEFT JOIN listings l ON u.id = l.donor_id
    WHERE u.role = 'donor'
    GROUP BY u.id
    ORDER BY mealsProvided DESC, totalDonations DESC
    LIMIT 5
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all NGOs
app.get('/api/ngos', (req, res) => {
  const sql = `SELECT id, name, email, role, phone, location, description FROM users WHERE role = 'ngo' ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update User Profile
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { phone, location, description } = req.body;
  
  const sql = `UPDATE users SET phone = ?, location = ?, description = ? WHERE id = ?`;
  db.run(sql, [phone, location, description, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch updated user
    db.get(`SELECT id, name, email, role, phone, location, description FROM users WHERE id = ?`, [id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated successfully', user });
    });
  });
});

// Get User Stats (Donations/Meals)
app.get('/api/users/:id/stats', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      COUNT(*) as totalDonations,
      SUM(CAST(qty AS INTEGER)) as mealsProvided
    FROM listings 
    WHERE donor_id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalDonations: row.totalDonations || 0,
      mealsProvided: row.mealsProvided || 0
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
