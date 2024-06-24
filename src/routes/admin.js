const express = require('express');
const router = express.Router();

const adminController = require('../app/controllers/adminController')

router.get('/login', adminController.login)
router.post('/login', adminController.checkAdmin)
router.get('/manageAccount', adminController.showAccount)
router.get('/createAccount', adminController.create)
router.post('/createAccount', adminController.createAccount)
router.delete('/deleteAccount/:id', adminController.deleteAccount)

module.exports = router