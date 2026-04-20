async function seedData() {
  console.log("Starting to seed real-looking demo data via API...");

  const donors = [
    { name: "The Grand Palace Hotel", email: "hotel@example.com", password: "password123", role: "donor" },
    { name: "Mama's Bakery", email: "bakery@example.com", password: "password123", role: "donor" },
    { name: "Fresh Foods Catering", email: "catering@example.com", password: "password123", role: "donor" }
  ];

  const ngos = [
    { name: "City Food Bank", email: "foodbank@example.com", password: "password123", role: "ngo" },
    { name: "Hope Shelter", email: "shelter@example.com", password: "password123", role: "ngo" }
  ];

  const images = {
    hotel: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80",
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
    catering: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=300&q=80",
    foodbank: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=300&q=80",
    shelter: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&q=80"
  };

  const dbIds = { donors: [], ngos: [] };

  // Helper to register, login, and update user
  async function createUser(userObj, profile_image, type) {
    try {
      await fetch('http://localhost:5000/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
      });
      const loginRes = await fetch('http://localhost:5000/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userObj.email, password: userObj.password })
      });
      const loginData = await loginRes.json();
      
      const id = loginData.user.id;
      if (type === 'donor') dbIds.donors.push({ id, name: userObj.name });
      else dbIds.ngos.push({ id, name: userObj.name });

      // Update profile
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: "+1 555-0000", location: "Downtown NY",
          description: "A great organization committed to the community.",
          profile_image
        })
      });
      console.log(`Created ${type} ${userObj.name}`);
    } catch (e) {
      console.error(e);
    }
  }

  // 1. Create Users sequentially to avoid api spam issues
  for (let d of donors) await createUser(d, images[d.email.split('@')[0]], 'donor');
  for (let n of ngos) await createUser(n, images[n.email.split('@')[0]], 'ngo');

  // 2. Create Listings
  const listingsData = [
    { donorIndex: 0, title: "Gourmet Sandwiches and Salads", qty: 40, unit: "meals", expiry: "Today at 8:00 PM", image: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=600&q=80" },
    { donorIndex: 1, title: "Freshly Baked Baguettes & Croissants", qty: 50, unit: "kg", expiry: "Tomorrow at 10:00 AM", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80" },
    { donorIndex: 1, title: "Assorted Muffins and Cookies", qty: 15, unit: "kg", expiry: "Today at 6:00 PM", image: "https://images.unsplash.com/photo-1558961363-fa18df10f409?auto=format&fit=crop&w=600&q=80" },
    { donorIndex: 2, title: "Leftover Roasted Chicken & Veggies", qty: 100, unit: "meals", expiry: "Today at 11:30 PM", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80" },
    { donorIndex: 2, title: "Pasta Tray (Event Surplus)", qty: 25, unit: "kg", expiry: "Tomorrow at 12:00 PM", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80" }
  ];

  for (let i = 0; i < listingsData.length; i++) {
    const l = listingsData[i];
    const donor = dbIds.donors[l.donorIndex];
    if (!donor) continue;

    const res = await fetch('http://localhost:5000/api/listings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donor_id: donor.id, donor_name: donor.name,
        title: l.title, qty: l.qty, unit: l.unit, expiry: l.expiry, image: l.image
      })
    });
    const ls = await res.json();
    console.log(`Created listing: ${l.title}`);

    // If it's the 3rd one, let's claim it fully
    if (i === 2) {
      await fetch(`http://localhost:5000/api/listings/${ls.id}/claim`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngo_id: dbIds.ngos[0].id, ngo_name: dbIds.ngos[0].name, claimed_qty: l.qty
        })
      });
      console.log(`Made claim for: ${l.title}`);
    }
  }
  
  console.log("Successfully seeded database via API!");
}

seedData();
