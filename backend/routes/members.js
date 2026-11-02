const express = require('express');
const pool = require('../db');

const router = express.Router();

const MEMBERS_BASE_QUERY = `
    SELECT
        m.id, m.full_name, m.email, m.phone, m.join_date, m.status,
        p.name AS plan_name,
        ms.start_date AS membership_start,
        ms.end_date AS membership_end,
        ms.status AS membership_status
    FROM members m
    LEFT JOIN memberships ms ON ms.member_id = m.id
        AND ms.id = (SELECT id FROM memberships WHERE member_id = m.id ORDER BY start_date DESC LIMIT 1)
    LEFT JOIN membership_plans p ON p.id = ms.plan_id
`;

async function getMemberById(conn, id) {
    const [[row]] = await conn.query(`${MEMBERS_BASE_QUERY} WHERE m.id = ?`, [id]);
    return row;
}

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`${MEMBERS_BASE_QUERY} ORDER BY m.id`);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const { full_name, email, phone, plan_name, status } = req.body;
    if (!full_name || !email || !phone || !plan_name) {
        return res.status(400).json({ error: 'full_name, email, phone, and plan_name are required' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [[plan]] = await conn.query(
            'SELECT id, duration_months, price FROM membership_plans WHERE name = ?',
            [plan_name]
        );
        if (!plan) {
            await conn.rollback();
            return res.status(400).json({ error: `Unknown plan: ${plan_name}` });
        }

        const [memberResult] = await conn.query(
            'INSERT INTO members (full_name, email, phone, join_date, status) VALUES (?, ?, ?, CURDATE(), ?)',
            [full_name, email, phone, status || 'Active']
        );
        const memberId = memberResult.insertId;

        const [membershipResult] = await conn.query(
            `INSERT INTO memberships (member_id, plan_id, start_date, end_date, status)
             VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? MONTH), 'Active')`,
            [memberId, plan.id, plan.duration_months]
        );

        await conn.query(
            `INSERT INTO fees (member_id, membership_id, amount, due_date, status)
             VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Pending')`,
            [memberId, membershipResult.insertId, plan.price]
        );

        await conn.commit();

        const created = await getMemberById(pool, memberId);
        res.status(201).json(created);
    } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A member with this email already exists' });
        }
        next(err);
    } finally {
        conn.release();
    }
});

router.put('/:id', async (req, res, next) => {
    const { full_name, email, phone, status } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE members SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone), status = COALESCE(?, status) WHERE id = ?',
            [full_name, email, phone, status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        const updated = await getMemberById(pool, req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const [result] = await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
