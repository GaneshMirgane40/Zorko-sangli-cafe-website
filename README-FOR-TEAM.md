# ZORKO Sangli — Smart Café Digital Platform
### Walchand College of Engineering, Sangli (Mini Project II)
**Team:** Utkarsh Patil, Ganesh Mirgane, Anushka Patil  
**Guide:** Smt. Bharati S. Shetty — Academic Year 2026-27

---

## 🚀 Quick Setup & Run (2 Steps)

### Step 1: Install Dependencies
Open a terminal in this project folder and run:
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Administrator Access

* **Admin Portal URL:** `http://localhost:3000/admin`
* **Direct Login Page:** `http://localhost:3000/admin/login`
* **Admin Email:** `ganesh.mirgane@walchandsangli.ac.in`
* **Password:** `Ganesh@Zorko2026!`

*(You can also access the admin portal by clicking the **🔒 Staff Portal** link at the bottom of any page).*

---

## 🌐 Public Pages & Features

* **Homepage (`/`):** Hero, trending & best-seller items, live opening hours, café info, and guest highlights.
* **Digital Menu (`/menu`):** Full searchable menu with category filtering (Burgers, Pizza, Momos, Mojitos, Fries, etc.), diet tags, and live availability.
* **Offers & Combos (`/offers`):** Active deals and combos with savings calculations.
* **Student Zone (`/student-zone`):** Dedicated college student deals and perks.
* **Table QR Menu Generator (`/qr`):** 
  * Generate table-specific QR cards (Table 1 to 20).
  * Bulk print table standee tent cards for dining tables.
  * Download vector SVG or high-res PNG.
* **Guest Feedback (`/feedback`):** Form for customers to submit reviews and view approved guest highlights.
* **Gallery (`/gallery`):** Photos of the Sangli outlet ambiance and dining areas.

---

## 🛠️ Admin Management Tools

* **Menu Management (`/admin/menu`):**
  * One-click **In Stock / Out of Stock** live toggle.
  * Click-to-edit price in ₹.
  * Toggle **Best Seller** (⭐), **Trending** (🔥), or **Featured** (✨).
  * Add new dishes with categories, descriptions, and diet types.
* **Feedback Moderation (`/admin/feedback`):**
  * Review all customer submissions.
  * One-click **Approve**, **Reject**, or **Delete** reviews.
* **Table QR Standees (`/admin/qr`):**
  * Print or configure table tent cards.
* **Audit Log (`/admin`):**
  * Tracks every administrative action with timestamps.
