'use strict'

var express = require('express');
var LoanController = require('../controllers/loan');

var md_auth = require('../middlewares/authenticated');

var router = express.Router();

router.get('/getloantest',LoanController.testgetloan);
router.post('/saveloan/:id',md_auth.authenticated,LoanController.saveloan);
router.put('/updateloan/:id',md_auth.authenticated,LoanController.updateLoanReturnDate);
router.put('/endloan/:id',md_auth.authenticated,LoanController.endLoan);
router.get('/getloan/:id',LoanController.getLoan);
router.get('/getloans',LoanController.getLoans);
router.get('/searchloan/:search',LoanController.searchLoan);

module.exports = router;