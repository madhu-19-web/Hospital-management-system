import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const totalDoctors = db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    const todayAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?').get(today).count;

    const bedsSummary = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM beds
    `).get();

    const billsSummary = db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN status = 'Pending' THEN (total_amount - discount) ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN status = 'Paid' THEN paid_amount ELSE 0 END) as paidAmount
      FROM bills
    `).get();

    const todaySchedule = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name, d.department, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.appointment_date = ?
      ORDER BY a.appointment_time ASC
    `).all(today);

    const departments = db.prepare(`
      SELECT d.name, COUNT(doc.id) as doctor_count
      FROM departments d
      LEFT JOIN doctors doc ON d.name = doc.department
      GROUP BY d.name
    `).all();

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      beds: {
        total: bedsSummary.total || 0,
        available: bedsSummary.available || 0,
        occupied: bedsSummary.occupied || 0,
        maintenance: bedsSummary.maintenance || 0
      },
      finances: {
        pendingCount: billsSummary.pendingCount || 0,
        pendingAmount: billsSummary.pendingAmount || 0,
        totalRevenue: billsSummary.paidAmount || 0
      },
      todaySchedule,
      departments
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
