const express = require('express');
const router = express.Router();

const managerController = require('../app/controllers/managerController')

router.get('/login', managerController.login)
router.post('/login', managerController.checkManager)
router.get('/report', managerController.report)
router.post('/report', managerController.getReport)
router.get('/regulation', managerController.regulation)
router.post('/regulation', managerController.changeRegulation)

module.exports = router