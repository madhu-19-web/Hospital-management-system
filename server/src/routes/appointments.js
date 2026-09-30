import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all appointments (with optional date, doctor_id, and status filter)
router.get('/', (req, res) => {
  try {
    const { date, doctor_id, status } = req.query;
    let query = `
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.blood_group as patient_blood,
        p.gender as patient_gender,
        p.age as patient_age,
        d.name as doctor_name,
        d.specialization,
        d.department,
        d.consultation_fee
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }
    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }
    if (status && status !== 'All') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST schedule new appointment
router.post('/', (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Patient, doctor, date, and time are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
      VALUES (?, ?, ?, ?, ?, 'Scheduled', ?)
    `);

    stmt.run(
      parseInt(patient_id, 10),
      parseInt(doctor_id, 10),
      appointment_date,
      appointment_time,
      reason || 'General Consultation',
      notes || ''
    );

    const newId = db.prepare('SELECT last_insert_rowid() as id').get().id;
    const newAppointment = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        d.name as doctor_name,
        d.department,
        d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(newId);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// PATCH update appointment status / notes
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status' });
    }

    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const newStatus = status || appt.status;
    const newNotes = notes !== undefined ? notes : appt.notes;

    db.prepare('UPDATE appointments SET status = ?, notes = ? WHERE id = ?').run(newStatus, newNotes, id);

    const updated = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        d.name as doctor_name,
        d.department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(id);

    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE appointment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    res.json({ message: 'Appointment cancelled and removed' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
