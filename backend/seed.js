const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);
db.run("PRAGMA busy_timeout = 5000");

async function seedData() {
  console.log("Starting to seed real-looking demo data...");
  const defaultPassword = await bcrypt.hash('password123', 10);

  const donors = [
    {
      name: "The Grand Palace Hotel", email: "hotel@example.com",
      role: "donor", phone: "+1 (555) 101-0001", location: "Downtown NY",
      description: "A 5-star hotel committed to zero waste.",
      profile_image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Mama's Bakery", email: "bakery@example.com",
      role: "donor", phone: "+1 (555) 102-0002", location: "Brooklyn, NY",
      description: "Local bakery making fresh bread and pastries daily.",
      profile_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Fresh Foods Catering", email: "catering@example.com",
      role: "donor", phone: "+1 (555) 103-0003", location: "Queens, NY",
      description: "Premium catering for large corporate events.",
      profile_image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=300&q=80"
    }
  ];

  const ngos = [
    {
      name: "City Food Bank", email: "foodbank@example.com",
      role: "ngo", phone: "+1 (555) 201-0001", location: "Bronx, NY",
      description: "Distributing food to those in need across the city.",
      profile_image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Hope Shelter", email: "shelter@example.com",
      role: "ngo", phone: "+1 (555) 202-0002", location: "Manhattan, NY",
      description: "A safe haven providing hot meals three times a day.",
      profile_image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&q=80"
    }
  ];

  const listingsData = [
    {
      donorIndex: 0, title: "Gourmet Sandwiches and Salads",
      qty: 40, unit: "meals", original_qty: 40, available_qty: 15,
      expiry: "Today at 8:00 PM", status: "Available",
      image: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=600&q=80"
    },
    {
      donorIndex: 1, title: "Freshly Baked Baguettes & Croissants",
      qty: 50, unit: "kg", original_qty: 50, available_qty: 50,
      expiry: "Tomorrow at 10:00 AM", status: "Available",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
    },
    {
      donorIndex: 1, title: "Assorted Muffins and Cookies",
      qty: 15, unit: "kg", original_qty: 15, available_qty: 0,
      expiry: "Today at 6:00 PM", status: "Fully Claimed",
      image: "https://images.unsplash.com/photo-1558961363-fa18df10f409?auto=format&fit=crop&w=600&q=80"
    },
    {
      donorIndex: 2, title: "Leftover Roasted Chicken & Veggies",
      qty: 100, unit: "meals", original_qty: 100, available_qty: 60,
      expiry: "Today at 11:30 PM", status: "Available",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80"
    },
    {
      donorIndex: 2, title: "Pasta Tray (Event Surplus)",
      qty: 25, unit: "kg", original_qty: 25, available_qty: 25,
      expiry: "Tomorrow at 12:00 PM", status: "Available",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80"
    }
  ];

  db.serialize(() => {
    // 1. Clear existing data
    db.run("DELETE FROM claims");
    db.run("DELETE FROM listings");
    db.run("DELETE FROM users");
    db.run("UPDATE sqlite_sequence SET seq = 0");

    // 2. Insert Users (Donors and NGOs)
    const insertUser = db.prepare(`INSERT INTO users (name, email, password, role, phone, location, description, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
    let donorIds = [];
    let ngoIds = [];

    // Track insertion count to know when users are done
    let usersToInsert = donors.length + ngos.length;
    let usersInserted = 0;

    const finalizeUsersAndContinue = () => {
      usersInserted++;
      if (usersInserted === usersToInsert) {
        // 3. Insert Listings once users are ready
        insertListingsAndClaims();
      }
    };

    donors.forEach((d) => {
      insertUser.run([d.name, d.email, defaultPassword, d.role, d.phone, d.location, d.description, d.profile_image], function (err) {
        if (!err) donorIds.push({id: this.lastID, name: d.name});
        finalizeUsersAndContinue();
      });
    });

    ngos.forEach((n) => {
      insertUser.run([n.name, n.email, defaultPassword, n.role, n.phone, n.location, n.description, n.profile_image], function (err) {
        if (!err) ngoIds.push({id: this.lastID, name: n.name});
        finalizeUsersAndContinue();
      });
    });

    function insertListingsAndClaims() {
      const insertListing = db.prepare(`INSERT INTO listings (donor_id, donor_name, title, qty, unit, original_qty, available_qty, expiry, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertClaim = db.prepare(`INSERT INTO claims (listing_id, ngo_id, ngo_name, claimed_qty, status) VALUES (?, ?, ?, ?, ?)`);
      
      let listingsInserted = 0;

      listingsData.forEach((l) => {
        const donor = donorIds[l.donorIndex];
        insertListing.run([donor.id, donor.name, l.title, l.qty, l.unit, l.original_qty, l.available_qty, l.expiry, l.status, l.image], function (err) {
          if (err) console.error(err);
          const listingId = this.lastID;
          
          // Seed some claims if it's partially or fully claimed
          if (l.status === 'Fully Claimed' || l.available_qty < l.original_qty) {
            const claimedAmount = l.original_qty - l.available_qty;
            const ngo = ngoIds[0]; // first NGO claimed it
            insertClaim.run([listingId, ngo.id, ngo.name, claimedAmount, l.status === 'Fully Claimed' ? 'Completed' : 'Claimed']);
          }

          listingsInserted++;
          if (listingsInserted === listingsData.length) {
            console.log("Database successfully seeded with realistic data and images!");
            // Wait a moment for any pending callbacks
            setTimeout(() => db.close(), 500);
          }
        });
      });
    }
  });
}

seedData();
