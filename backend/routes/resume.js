const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected Routes
router.post('/upload', authMiddleware, upload.single('resume'), resumeController.uploadResume);
router.get('/dashboard', authMiddleware, resumeController.getDashboardData);

module.exports = router;
