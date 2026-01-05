// server.js - แก้ไขลำดับ Middleware เพื่อแก้ 404
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware พื้นฐาน
app.use(cors({ origin: ['https://phuriphatizamu.github.io'], methods: ['GET','POST'] }));
app.use(bodyParser.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rov_sn_tournament_2026';

mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB Connected`))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schema Definition
const ScheduleSchema = new mongoose.Schema({
    teams: [String],
    potA: [String],
    potB: [String],
    schedule: Array,
    createdAt: { type: Date, default: Date.now }
});
const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedules');

// ----------------------------------------------------
// 1. ประกาศ API Routes (ต้องอยู่ก่อน Static Files เสมอ!)
// ----------------------------------------------------

// Route สำหรับ /api เฉยๆ (เผื่อ Frontend เช็ค)
app.get('/api', (req, res) => {
    res.status(200).json({ message: "API is running", status: "ok" });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running', db: 'rov_sn_tournament_2026' });
});

// Create Schedule
app.post('/api/schedules', async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const saved = await newSchedule.save();
        console.log('📝 New schedule saved:', saved._id);
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Schedules
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ createdAt: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------------------------------------------------
// 2. ประกาศ Static Files (เอาไว้ทีหลังสุด)
// ----------------------------------------------------

// ให้ Express เข้าถึงไฟล์ Frontend
app.use(express.static(__dirname));

// Route หลัก ('/') ส่งหน้าเว็บ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
