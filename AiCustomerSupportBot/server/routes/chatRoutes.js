const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.post('/chat', chatController.handleChat);
router.get('/session/:id', chatController.getSessionHistory);

module.exports = router;