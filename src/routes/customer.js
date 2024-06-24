const express = require('express');
const router = express.Router();

const customerController = require('../app/controllers/customerController')

router.get('/login', customerController.login)
router.get('/signup', customerController.signup)
router.post('/login', customerController.checkCustomer)
router.post('/signup', customerController.createCustomer)
router.get('/logout', customerController.logout)
router.get('/myFlight', customerController.showMyFlight)
router.delete('/myFlight/:id/:ticketRank', customerController.deleteMyFlight)

module.exports = router