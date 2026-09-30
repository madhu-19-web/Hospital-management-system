import { db, initDatabase } from './database.js';

export function seedData() {
  initDatabase();

  // Clear existing records
  db.exec(`
    DELETE FROM bill_items;
    DELETE FROM bills;
    DELETE FROM appointments;
    DELETE FROM beds;
    DELETE FROM patients;
    DELETE FROM doctors;
    DELETE FROM departments;
  `);

  console.log('Cleared existing database tables.');

  // Seed Departments
  const departments = [
    { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics and intervention.', head: 'Dr. Sarah Jenkins' },
    { name: 'Neurology', description: 'Diagnosis and advanced treatment for disorders of the nervous system.', head: 'Dr. Marcus Vance' },
    { name: 'Pediatrics', description: 'Dedicated healthcare services for infants, children, and adolescents.', head: 'Dr. Elena Rostova' },
    { name: 'Orthopedics', description: 'Specialized musculoskeletal, joint replacement, and trauma surgery.', head: 'Dr. Arthur Campbell' },
    { name: 'General Medicine', description: 'Primary healthcare, internal medicine, and preventative diagnostics.', head: 'Dr. Priya Sharma' },
    { name: 'Dermatology', description: 'Expert clinical skincare, oncology screening, and cosmetic treatments.', head: 'Dr. Liam Gallagher' },
    { name: 'Emergency Care', description: '24/7 acute critical care, resuscitation, and trauma management.', head: 'Dr. Chloe Bennett' }
  ];

  const insertDept = db.prepare('INSERT INTO departments (name, description, head_doctor) VALUES (?, ?, ?)');
  for (const d of departments) {
    insertDept.run(d.name, d.description, d.head);
  }

  // Seed Doctors
  const doctors = [
    { name: 'Dr. Sarah Jenkins', specialization: 'Cardiologist', department: 'Cardiology', email: 's.jenkins@metropolitanhealth.org', phone: '+1 (555) 234-5671', fee: 120.0, days: 'Mon, Wed, Fri', time: '09:00 - 14:00' },
    { name: 'Dr. Marcus Vance', specialization: 'Neurologist', department: 'Neurology', email: 'm.vance@metropolitanhealth.org', phone: '+1 (555) 345-6782', fee: 150.0, days: 'Tue, Thu, Sat', time: '10:00 - 16:00' },
    { name: 'Dr. Elena Rostova', specialization: 'Pediatrician', department: 'Pediatrics', email: 'e.rostova@metropolitanhealth.org', phone: '+1 (555) 456-7893', fee: 90.0, days: 'Mon - Fri', time: '08:30 - 15:30' },
    { name: 'Dr. Arthur Campbell', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', email: 'a.campbell@metropolitanhealth.org', phone: '+1 (555) 567-8904', fee: 135.0, days: 'Mon, Tue, Thu', time: '09:00 - 15:00' },
    { name: 'Dr. Priya Sharma', specialization: 'Internist & General Physician', department: 'General Medicine', email: 'p.sharma@metropolitanhealth.org', phone: '+1 (555) 678-9015', fee: 80.0, days: 'Mon - Sat', time: '08:00 - 17:00' },
    { name: 'Dr. Liam Gallagher', specialization: 'Dermatologist', department: 'Dermatology', email: 'l.gallagher@metropolitanhealth.org', phone: '+1 (555) 789-0126', fee: 95.0, days: 'Wed, Thu, Fri', time: '11:00 - 18:00' },
    { name: 'Dr. Chloe Bennett', specialization: 'Emergency Specialist', department: 'Emergency Care', email: 'c.bennett@metropolitanhealth.org', phone: '+1 (555) 890-1237', fee: 110.0, days: 'Mon - Sun', time: '00:00 - 23:59' }
  ];

  const insertDoctor = db.prepare('INSERT INTO doctors (name, specialization, department, email, phone, consultation_fee, available_days, available_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const doc of doctors) {
    insertDoctor.run(doc.name, doc.specialization, doc.department, doc.email, doc.phone, doc.fee, doc.days, doc.time);
  }

  // Seed Patients
  const patients = [
    { name: 'James Wilson', dob: '1982-04-14', age: 44, gender: 'Male', blood: 'O+', phone: '+1 (555) 111-2233', email: 'j.wilson@email.com', address: '742 Evergreen Terrace, Springfield', emergency: 'Linda Wilson (Spouse) - +1 (555) 111-2234', allergies: 'Penicillin', history: 'Mild hypertension diagnosed 2021' },
    { name: 'Sophia Martinez', dob: '1995-09-22', age: 31, gender: 'Female', blood: 'A+', phone: '+1 (555) 222-3344', email: 'sophia.m@email.com', address: '124 Blossom Hill Rd, San Jose', emergency: 'Carlos Martinez (Father) - +1 (555) 222-3345', allergies: 'Peanuts, Sulfa drugs', history: 'Asthma since childhood' },
    { name: 'Robert Chen', dob: '1968-11-05', age: 58, gender: 'Male', blood: 'B+', phone: '+1 (555) 333-4455', email: 'rchen@email.com', address: '88 Oakridge Lane, Seattle', emergency: 'Emily Chen (Daughter) - +1 (555) 333-4456', allergies: 'None known', history: 'Type 2 Diabetes, on Metformin' },
    { name: 'Amara Okafor', dob: '2001-02-18', age: 25, gender: 'Female', blood: 'AB-', phone: '+1 (555) 444-5566', email: 'amara.okafor@email.com', address: '450 Pine St, Boston', emergency: 'Nnamdi Okafor (Brother) - +1 (555) 444-5567', allergies: 'Latex', history: 'Routine preventive care' },
    { name: 'David Miller', dob: '1954-07-30', age: 72, gender: 'Male', blood: 'O-', phone: '+1 (555) 555-6677', email: 'd.miller54@email.com', address: '302 Birch Way, Austin', emergency: 'Mary Miller (Wife) - +1 (555) 555-6678', allergies: 'Aspirin', history: 'Coronary artery disease, Stent placed 2019' },
    { name: 'Emily Davis', dob: '2016-06-12', age: 10, gender: 'Female', blood: 'A-', phone: '+1 (555) 666-7788', email: 'sarah.davis.parent@email.com', address: '19 Maple Ave, Denver', emergency: 'Sarah Davis (Mother) - +1 (555) 666-7788', allergies: 'None', history: 'Childhood vaccinations up to date' },
    { name: 'Lucas Wright', dob: '1990-12-03', age: 36, gender: 'Male', blood: 'B-', phone: '+1 (555) 777-8899', email: 'lucas.wright@email.com', address: '55 Cedar Court, Portland', emergency: 'Jessica Wright (Sister) - +1 (555) 777-8800', allergies: 'Ibuprofen', history: 'Knee arthroscopy 2023' }
  ];

  const insertPatient = db.prepare('INSERT INTO patients (name, dob, age, gender, blood_group, phone, email, address, emergency_contact, allergies, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const p of patients) {
    insertPatient.run(p.name, p.dob, p.age, p.gender, p.blood, p.phone, p.email, p.address, p.emergency, p.allergies, p.history);
  }

  // Today's date string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Seed Appointments
  const appointments = [
    { patient_id: 1, doctor_id: 1, date: today, time: '09:30', reason: 'Routine cardiac follow-up and ECG review', status: 'In-Progress', notes: 'Blood pressure currently 130/82.' },
    { patient_id: 2, doctor_id: 5, date: today, time: '10:15', reason: 'Seasonal asthma exacerbation & inhaler refill', status: 'Scheduled', notes: 'Patient reports shortness of breath on exertion.' },
    { patient_id: 3, doctor_id: 5, date: today, time: '11:00', reason: 'HbA1c quarterly review and fasting lab check', status: 'Scheduled', notes: 'Fasting glucose was 118 mg/dL last week.' },
    { patient_id: 4, doctor_id: 6, date: today, time: '14:00', reason: 'Skin rash examination and allergy assessment', status: 'Scheduled', notes: 'Mild eczema on forearm.' },
    { patient_id: 5, doctor_id: 1, date: tomorrow, time: '10:00', reason: 'Post-op cardiac checkup', status: 'Scheduled', notes: '' },
    { patient_id: 6, doctor_id: 3, date: tomorrow, time: '11:30', reason: 'Annual wellness checkup and growth monitoring', status: 'Scheduled', notes: '' },
    { patient_id: 7, doctor_id: 4, date: today, time: '08:45', reason: 'Right knee joint pain after jogging', status: 'Completed', notes: 'Prescribed physical therapy twice weekly.' }
  ];

  const insertAppt = db.prepare('INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const a of appointments) {
    insertAppt.run(a.patient_id, a.doctor_id, a.date, a.time, a.reason, a.status, a.notes);
  }

  // Seed Beds
  const beds = [
    { bed_number: 'ICU-101', ward: 'ICU', status: 'Occupied', rate: 450.0, patient_id: 5, admitted_at: today + ' 07:30' },
    { bed_number: 'ICU-102', ward: 'ICU', status: 'Available', rate: 450.0, patient_id: null, admitted_at: null },
    { bed_number: 'ICU-103', ward: 'ICU', status: 'Available', rate: 450.0, patient_id: null, admitted_at: null },
    { bed_number: 'GW-201', ward: 'General Ward', status: 'Occupied', rate: 120.0, patient_id: 1, admitted_at: today + ' 09:00' },
    { bed_number: 'GW-202', ward: 'General Ward', status: 'Available', rate: 120.0, patient_id: null, admitted_at: null },
    { bed_number: 'GW-203', ward: 'General Ward', status: 'Available', rate: 120.0, patient_id: null, admitted_at: null },
    { bed_number: 'GW-204', ward: 'General Ward', status: 'Maintenance', rate: 120.0, patient_id: null, admitted_at: null },
    { bed_number: 'SP-301', ward: 'Semi-Private', status: 'Occupied', rate: 220.0, patient_id: 3, admitted_at: today + ' 08:15' },
    { bed_number: 'SP-302', ward: 'Semi-Private', status: 'Available', rate: 220.0, patient_id: null, admitted_at: null },
    { bed_number: 'SP-303', ward: 'Semi-Private', status: 'Available', rate: 220.0, patient_id: null, admitted_at: null },
    { bed_number: 'EM-001', ward: 'Emergency', status: 'Available', rate: 300.0, patient_id: null, admitted_at: null },
    { bed_number: 'EM-002', ward: 'Emergency', status: 'Available', rate: 300.0, patient_id: null, admitted_at: null }
  ];

  const insertBed = db.prepare('INSERT INTO beds (bed_number, ward, status, daily_rate, patient_id, admitted_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const b of beds) {
    insertBed.run(b.bed_number, b.ward, b.status, b.rate, b.patient_id, b.admitted_at);
  }

  // Seed Bills & Bill Items
  const bills = [
    {
      patient_id: 1,
      bill_date: today,
      total_amount: 320.0,
      discount: 20.0,
      paid_amount: 300.0,
      status: 'Paid',
      payment_method: 'Credit Card',
      notes: 'Payment received in full at reception desk.',
      items: [
        { description: 'Cardiology Specialist Consultation', quantity: 1, unit_price: 120.0, total: 120.0 },
        { description: '12-Lead Electrocardiogram (ECG)', quantity: 1, unit_price: 80.0, total: 80.0 },
        { description: 'General Ward Day Observation Fee', quantity: 1, unit_price: 120.0, total: 120.0 }
      ]
    },
    {
      patient_id: 5,
      bill_date: today,
      total_amount: 950.0,
      discount: 50.0,
      paid_amount: 0.0,
      status: 'Pending',
      payment_method: null,
      notes: 'Pending final discharge and insurance claim settlement.',
      items: [
        { description: 'Intensive Care Unit (ICU) Daily Room Charge', quantity: 1, unit_price: 450.0, total: 450.0 },
        { description: 'Cardiac Telemetry Continuous Monitoring', quantity: 1, unit_price: 250.0, total: 250.0 },
        { description: 'Specialist Rounds & Emergency Intervention', quantity: 2, unit_price: 125.0, total: 250.0 }
      ]
    },
    {
      patient_id: 7,
      bill_date: today,
      total_amount: 195.0,
      discount: 0.0,
      paid_amount: 195.0,
      status: 'Paid',
      payment_method: 'Insurance / Health Savings',
      notes: 'Copay collected at checkout.',
      items: [
        { description: 'Orthopedic Consultation Fee', quantity: 1, unit_price: 135.0, total: 135.0 },
        { description: 'Right Knee Diagnostic X-Ray (2 Views)', quantity: 1, unit_price: 60.0, total: 60.0 }
      ]
    }
  ];

  const insertBill = db.prepare('INSERT INTO bills (patient_id, bill_date, total_amount, discount, paid_amount, status, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertBillItem = db.prepare('INSERT INTO bill_items (bill_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)');

  for (const bill of bills) {
    insertBill.run(bill.patient_id, bill.bill_date, bill.total_amount, bill.discount, bill.paid_amount, bill.status, bill.payment_method, bill.notes);
    // Get inserted bill id
    const lastIdRow = db.prepare('SELECT last_insert_rowid() as id').get();
    const billId = lastIdRow.id;
    for (const item of bill.items) {
      insertBillItem.run(billId, item.description, item.quantity, item.unit_price, item.total);
    }
  }

  console.log('Database seeded successfully with realistic healthcare datasets!');
}

// Run if called directly
seedData();
