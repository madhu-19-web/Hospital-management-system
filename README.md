# CarePulse - Hospital Management System (HMS)

CarePulse is a modern, full-stack Hospital Management System engineered to simplify clinical operations, inpatient admissions, patient electronic health records (EHR), physician scheduling, and medical billing.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-0ea5e9)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-10b981)
![Database](https://img.shields.io/badge/Database-SQLite%20(Native%20node:sqlite)-f59e0b)

---

## 🌟 Key Features

1. **Operations Dashboard**
   - Live KPI overview (Total Patients, Today's Appointments, Inpatient Bed Occupancy, Revenue vs. Pending Collection).
   - Real-time appointment agenda for today.
   - Clinical department capacity breakdown.
   - Quick action shortcuts for instant patient intake and booking.

2. **Patient Electronic Health Records (EHR)**
   - Searchable patient registry (by name, phone, email, blood type).
   - Detailed patient dossier with medical history, allergies, bed stay status, past appointments, and invoices.
   - Patient intake and electronic registration modal.

3. **Physicians & Clinical Rosters**
   - Department filtering (Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine, Dermatology, Emergency).
   - Doctor profiles with consulting fee, weekly clinic days, and active hours.
   - 1-click appointment booking connected directly to doctor schedules.

4. **Appointment Scheduling**
   - Slot booking with patient and doctor selectors.
   - Workflow stage management (`Scheduled` ➔ `In-Progress` ➔ `Completed` / `Cancelled`).
   - Filter by status or appointment date.

5. **Inpatient Bed & Ward Management**
   - Real-time floor status across Wards: General Ward, ICU, Semi-Private, Emergency.
   - Bed status tracking (`Available`, `Occupied`, `Maintenance/Sanitizing`).
   - Inpatient admission and discharge workflows.

6. **Medical Billing & Invoicing**
   - Itemized line items builder (Consultations, Diagnostic tests, Room charges, Pharmacy).
   - Tax/discount calculation.
   - Payment collection recording (Credit Card, Insurance Claim, Cash, Bank Transfer).
   - Official printable patient statement & medical receipt.

---

## 📁 Architecture

```
hospital-management-system/
├── package.json               # Root scripts to orchestrate client & server
├── README.md                  # System documentation
│
├── server/                    # Node.js + Express REST API
│   ├── package.json
│   ├── hospital.db            # SQLite database file (created automatically)
│   └── src/
│       ├── server.js          # Express app entry & route mounting
│       ├── db/
│       │   ├── database.js    # Native node:sqlite schema & initialization
│       │   └── seed.js        # Realistic sample healthcare data generator
│       └── routes/
│           ├── stats.js       # Dashboard KPI analytics
│           ├── patients.js    # Patient EHR & history endpoints
│           ├── doctors.js     # Doctors & departments endpoints
│           ├── appointments.js# Appointment booking & status lifecycle
│           ├── beds.js        # Ward bed occupancy, admit, & discharge
│           └── bills.js       # Invoicing & payment endpoints
│
└── client/                    # React 18 + Vite Frontend
    ├── package.json
    ├── vite.config.js         # Configured with proxy to http://localhost:5000
    ├── tailwind.config.js     # Custom healthcare teal color system
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx            # Main app shell & dynamic tab routing
        ├── components/
        │   ├── Navbar.jsx     # Top facility header, live time, emergency banner
        │   └── Sidebar.jsx    # Navigation links with live count badges
        └── pages/
            ├── Dashboard.jsx   # Clinical command center
            ├── Patients.jsx    # Patient directory & modal
            ├── Doctors.jsx      # Doctor directory & schedule cards
            ├── Appointments.jsx # Appointment management & stage controls
            ├── Beds.jsx        # Inpatient ward floor map & bed actions
            └── Billing.jsx     # Invoicing & printable receipts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v22.5.0 or higher (v24 recommended, which includes built-in `node:sqlite`)
- **npm**

### Step 1: Install Dependencies
From the project root:
```bash
# Windows PowerShell
npm.cmd run install:all
```
*(Or install in both folders individually: `cd server && npm install`, then `cd ../client && npm install`)*

### Step 2: Seed Sample Data
Populate the database with realistic doctors, patients, beds, appointments, and invoices:
```bash
npm.cmd run seed
```

### Step 3: Run Development Servers
Start both the backend API and frontend application simultaneously:
```bash
npm.cmd run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | High-level KPI metrics for the dashboard |
| `GET` | `/api/patients` | Search and list patients (`?search=`) |
| `POST`| `/api/patients` | Register a new patient |
| `GET` | `/api/patients/:id` | Get patient profile with full history |
| `DELETE`| `/api/patients/:id` | Remove a patient record |
| `GET` | `/api/doctors` | List doctors (`?department=`) |
| `POST`| `/api/doctors` | Add a doctor profile |
| `GET` | `/api/doctors/departments` | List all clinical specialties |
| `GET` | `/api/appointments` | List appointments (`?status=`, `?date=`) |
| `POST`| `/api/appointments` | Book a new appointment |
| `PATCH`| `/api/appointments/:id/status` | Advance appointment stage |
| `GET` | `/api/beds` | Bed status roster (`?ward=`, `?status=`) |
| `POST`| `/api/beds/admit` | Admit patient to bed |
| `POST`| `/api/beds/discharge/:id`| Discharge patient and free bed |
| `GET` | `/api/bills` | List invoices (`?status=`) |
| `POST`| `/api/bills` | Issue invoice with line items |
| `PATCH`| `/api/bills/:id/pay` | Record payment |
