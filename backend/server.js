require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const membersRouter = require('./routes/members');
const feesRouter = require('./routes/fees');
const attendanceRouter = require('./routes/attendance');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/fees', feesRouter);
app.use('/api/attendance', attendanceRouter);

app.use(express.static(path.join(__dirname, '..')));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Gym Management API + frontend listening on http://localhost:${PORT}`);
});
