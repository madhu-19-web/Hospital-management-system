import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all doctors (with optional department filter)
router.get('/', (req, res) => {
  try {
    const { department } = req.query;
    let query = 'SELECT * FROM doctors';
    let params = [];

    if (department && department !== 'All') {
      query += ' WHERE department = ?';
      params = [department];
    }

    query += ' ORDER BY name ASC';
    const doctors = db.prepare(query).all(...params);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET all departments
router.get('/departments', (req, res) => {
  try {
    const departments = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET single doctor by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ? AND a.appointment_date = ?
      ORDER BY a.appointment_time ASC
    `).all(id, today);

    res.json({ ...doctor, todayAppointments });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST create doctor
router.post('/', (req, res) => {
  try {
    const { name, specialization, department, email, phone, consultation_fee, available_days, available_time } = req.body;

    if (!name || !specialization || !department) {
      return res.status(400).json({ error: 'Name, specialization, and department are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO doctors (name, specialization, department, email, phone, consultation_fee, available_days, available_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      name.trim(),
      specialization.trim(),
      department.trim(),
      email || null,
      phone || null,
      consultation_fee ? parseFloat(consultation_fee) : 75.0,
      available_days || 'Mon - Fri',
      available_time || '09:00 - 16:00'
    );

    const newId = db.prepare('SELECT last_insert_rowid() as id').get().id;
    const newDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(newId);

    res.status(201).json(newDoctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor record' });
  }
});

// PUT update doctor
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, department, email, phone, consultation_fee, available_days, available_time, status } = req.body;

    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const stmt = db.prepare(`
      UPDATE doctors
      SET name = ?, specialization = ?, department = ?, email = ?, phone = ?, consultation_fee = ?, available_days = ?, available_time = ?, status = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      specialization,
      department,
      email || null,
      phone || null,
      parseFloat(consultation_fee) || 75.0,
      available_days || 'Mon - Fri',
      available_time || '09:00 - 16:00',
      status || 'Active',
      id
    );

    const updated = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor record' });
  }
});

export default router;
