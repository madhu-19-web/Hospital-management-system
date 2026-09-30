import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all patients (with optional search)
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM patients';
    let params = [];

    if (search && search.trim() !== '') {
      query += ` WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR blood_group LIKE ?`;
      const term = `%${search.trim()}%`;
      params = [term, term, term, term];
    }

    query += ' ORDER BY id DESC';
    const patients = db.prepare(query).all(...params);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET single patient with medical history, appointments, bills, and bed assignment
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const appointments = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization, d.department
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(id);

    const bills = db.prepare(`
      SELECT * FROM bills WHERE patient_id = ? ORDER BY bill_date DESC
    `).all(id);

    const bed = db.prepare(`
      SELECT * FROM beds WHERE patient_id = ?
    `).get(id);

    res.json({
      ...patient,
      appointments,
      bills,
      bed: bed || null
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

// POST create patient
router.post('/', (req, res) => {
  try {
    const {
      name, dob, age, gender, blood_group,
      phone, email, address, emergency_contact,
      allergies, medical_history
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO patients (name, dob, age, gender, blood_group, phone, email, address, emergency_contact, allergies, medical_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      name.trim(),
      dob || null,
      age ? parseInt(age, 10) : null,
      gender || 'Other',
      blood_group || 'Unknown',
      phone || null,
      email || null,
      address || null,
      emergency_contact || null,
      allergies || 'None',
      medical_history || 'No prior medical record'
    );

    const newId = db.prepare('SELECT last_insert_rowid() as id').get().id;
    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(newId);

    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to register patient' });
  }
});

// PUT update patient
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, dob, age, gender, blood_group,
      phone, email, address, emergency_contact,
      allergies, medical_history
    } = req.body;

    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const stmt = db.prepare(`
      UPDATE patients
      SET name = ?, dob = ?, age = ?, gender = ?, blood_group = ?, phone = ?, email = ?, address = ?, emergency_contact = ?, allergies = ?, medical_history = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      dob || null,
      age ? parseInt(age, 10) : null,
      gender || 'Other',
      blood_group || 'Unknown',
      phone || null,
      email || null,
      address || null,
      emergency_contact || null,
      allergies || 'None',
      medical_history || 'No prior medical record',
      id
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE patient
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Free any assigned bed
    db.prepare(`UPDATE beds SET status = 'Available', patient_id = NULL, admitted_at = NULL WHERE patient_id = ?`).run(id);

    db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
