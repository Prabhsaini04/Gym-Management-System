const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { status } = req.query;
        const params = [];
        let sql = `
            SELECT f.id, f.member_id, m.full_name AS member_name, f.amount, f.due_date, f.paid_date, f.status
            FROM fees f
            JOIN members m ON m.id = f.member_id
        `;
        if (status && status !== 'all') {
            sql += ' WHERE f.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY f.due_date DESC';

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const { member_id, amount, due_date } = req.body;
    if (!member_id || !amount || !due_date) {
        return res.status(400).json({ error: 'member_id, amount, and due_date are required' });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO fees (member_id, amount, due_date, status) VALUES (?, ?, ?, 'Pending')`,
            [member_id, amount, due_date]
        );
        res.status(201).json({ id: result.insertId, member_id, amount, due_date, status: 'Pending' });
    } catch (err) {
        next(err);
    }
});

router.put('/:id/pay', async (req, res, next) => {
    try {
        const [result] = await pool.query(
            `UPDATE fees SET status = 'Paid', paid_date = CURDATE() WHERE id = ?`,
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Fee not found' });
        }
        res.json({ id: Number(req.params.id), status: 'Paid' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
