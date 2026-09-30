import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all beds (with optional ward and status filter)
router.get('/', (req, res) => {
  try {
    const { ward, status } = req.query;
    let query = `
      SELECT 
        b.*,
        p.name as patient_name,
        p.gender as patient_gender,
        p.age as patient_age,
        p.blood_group as patient_blood,
        p.phone as patient_phone
      FROM beds b
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (ward && ward !== 'All') {
      query += ' AND b.ward = ?';
      params.push(ward);
    }
    if (status && status !== 'All') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.ward ASC, b.bed_number ASC';
    const beds = db.prepare(query).all(...params);
    res.json(beds);
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ error: 'Failed to fetch bed allocations' });
  }
});

// POST admit patient to a bed
router.post('/admit', (req, res) => {
  try {
    const { bed_id, patient_id } = req.body;

    if (!bed_id || !patient_id) {
      return res.status(400).json({ error: 'Bed ID and Patient ID are required' });
    }

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(bed_id);
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    if (bed.status === 'Occupied') {
      return res.status(400).json({ error: 'Bed is currently occupied' });
    }

    // Check if patient is already admitted to another bed
    const existingBed = db.prepare('SELECT * FROM beds WHERE patient_id = ?').get(patient_id);
    if (existingBed) {
      return res.status(400).json({ error: `Patient is already admitted to bed ${existingBed.bed_number}` });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    db.prepare(`
      UPDATE beds 
      SET status = 'Occupied', patient_id = ?, admitted_at = ?
      WHERE id = ?
    `).run(patient_id, now, bed_id);

    const updatedBed = db.prepare(`
      SELECT b.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age, p.phone as patient_phone
      FROM beds b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?
    `).get(bed_id);

    res.json(updatedBed);
  } catch (error) {
    console.error('Error admitting patient:', error);
    res.status(500).json({ error: 'Failed to admit patient' });
  }
});

// POST discharge patient from bed
router.post('/discharge/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);

    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }

    db.prepare(`
      UPDATE beds
      SET status = 'Available', patient_id = NULL, admitted_at = NULL
      WHERE id = ?
    `).run(id);

    const updated = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);
    res.json({ message: 'Patient discharged successfully', bed: updated });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).json({ error: 'Failed to discharge patient' });
  }
});

// PATCH toggle bed status (e.g., set to Maintenance / Available)
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Available', 'Maintenance'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Status can only be toggled to Available or Maintenance' });
    }

    const bed = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    if (bed.status === 'Occupied') {
      return res.status(400).json({ error: 'Cannot change status of an occupied bed. Discharge patient first.' });
    }

    db.prepare('UPDATE beds SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM beds WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling bed status:', error);
    res.status(500).json({ error: 'Failed to update bed status' });
  }
});

export default router;
