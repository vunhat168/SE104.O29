const express = require('express');
const router = express.Router();

const airportController = require('../app/controllers/airportController')

router.get('/store', airportController.store)
router.post('/store', airportController.create)
router.delete('/delete/:name', airportController.deleteAirport)

module.exports = router