const express = require('express');
const router = express.Router();

const flightController = require('../app/controllers/flightController')

router.get('/store', flightController.store)
router.get('/create', flightController.create)
router.post('/create', flightController.createFlight)
router.delete('/delete/:flightId', flightController.deleteFlight)
router.get('/update/:flightId', flightController.update)
router.put('/:flightId', flightController.updateFlight)

module.exports = router