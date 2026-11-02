const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.id, a.member_id, m.full_name AS member_name,
                   a.check_in_date, a.check_in_time, a.check_out_time
            FROM attendance a
            JOIN members m ON m.id = a.member_id
            ORDER BY a.check_in_date DESC, a.check_in_time DESC
        `);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const { member_id, check_in_date, check_in_time } = req.body;
    if (!member_id || !check_in_date || !check_in_time) {
        return res.status(400).json({ error: 'member_id, check_in_date, and check_in_time are required' });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO attendance (member_id, check_in_date, check_in_time) VALUES (?, ?, ?)`,
            [member_id, check_in_date, check_in_time]
        );
        res.status(201).json({ id: result.insertId, member_id, check_in_date, check_in_time, check_out_time: null });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
