// server.js - Backend สำหรับเชื่อมต่อ MongoDB
// วิธีรัน: node server.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // อนุญาตให้หน้าเว็บเรียกใช้ API ได้
app.use(bodyParser.json());

// --- การตั้งค่า Database ---
// ใช้ MongoDB Atlas จาก environment variable (.env file)
// Fallback เป็น localhost ถ้าไม่มี .env
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rov_sn_tournament_2026';

mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB Connected to: ${MONGO_URI}`))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. สร้าง Schema (โครงสร้างข้อมูล)
const ScheduleSchema = new mongoose.Schema({
    teams: [String],
    potA: [String],
    potB: [String],
    schedule: Array,
    createdAt: { type: Date, default: Date.now }
});

// สร้าง Model โดยระบุชื่อ Collection ให้ชัดเจนว่า 'schedules'
const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedules');

// 3. API Routes

// Root hint
app.get('/', (req, res) => {
    res.status(200).send('ROV SN Tournament API is running. Use /api/health for status.');
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running', db: 'rov_sn_tournament_2026' });
});

// บันทึกข้อมูล (Create)
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

// ดึงข้อมูลทั้งหมด (Read)
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ createdAt: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// เริ่ม Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Endpoint: http://localhost:${PORT}/api/schedules`);
    console.log(`💾 Target Database: rov_sn_tournament_2026`);
});
