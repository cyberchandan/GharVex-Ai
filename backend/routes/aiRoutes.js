const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/chat', protect, handleChat);

module.exports = router;
