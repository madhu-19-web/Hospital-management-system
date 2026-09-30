import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// GET all bills (with optional status filter)
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        b.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.bill_date DESC, b.id DESC';
    const bills = db.prepare(query).all(...params);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET single bill with items and patient details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bill = db.prepare(`
      SELECT 
        b.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        p.address as patient_address,
        p.blood_group as patient_blood
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?
    `).get(id);

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const items = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(id);
    res.json({ ...bill, items });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    res.status(500).json({ error: 'Failed to fetch bill details' });
  }
});

// POST generate new bill with line items
router.post('/', (req, res) => {
  try {
    const { patient_id, bill_date, discount, payment_method, notes, items, mark_as_paid } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: 'Patient is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one line item is required' });
    }

    const date = bill_date || new Date().toISOString().split('T')[0];
    const discountVal = parseFloat(discount) || 0;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.unit_price) || 0;
      totalAmount += (qty * price);
    }

    const netAmount = Math.max(0, totalAmount - discountVal);
    const isPaid = !!mark_as_paid;
    const status = isPaid ? 'Paid' : 'Pending';
    const paidAmount = isPaid ? netAmount : 0;

    const insertBillStmt = db.prepare(`
      INSERT INTO bills (patient_id, bill_date, total_amount, discount, paid_amount, status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBillStmt.run(
      parseInt(patient_id, 10),
      date,
      totalAmount,
      discountVal,
      paidAmount,
      status,
      payment_method || null,
      notes || ''
    );

    const billId = db.prepare('SELECT last_insert_rowid() as id').get().id;
    const insertItemStmt = db.prepare(`
      INSERT INTO bill_items (bill_id, description, quantity, unit_price, total)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.unit_price) || 0;
      insertItemStmt.run(billId, item.description, qty, price, qty * price);
    }

    const createdBill = db.prepare(`
      SELECT b.*, p.name as patient_name
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = ?
    `).get(billId);

    const createdItems = db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(billId);

    res.status(201).json({ ...createdBill, items: createdItems });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// PATCH pay bill
router.patch('/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const payable = Math.max(0, bill.total_amount - bill.discount);
    db.prepare(`
      UPDATE bills 
      SET status = 'Paid', paid_amount = ?, payment_method = ?
      WHERE id = ?
    `).run(payable, payment_method || 'Credit Card', id);

    const updated = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

export default router;
