const express = require('express');
const router = express.Router();

const bookingController = require('../app/controllers/bookingController')

router.get('/', bookingController.getInfo)
router.post('/', bookingController.search)
router.get('/ticket', bookingController.book)
router.post('/ticket', bookingController.createTicket)

module.exports = router