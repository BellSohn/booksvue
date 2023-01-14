'use strict'
 
var express = require('express');
var BookController = require('../controllers/book');

//Middleware
var md_auth = require('../middlewares/authenticated');

//to load image files
var fileUpload = require('express-fileupload');
var md_upload = fileUpload();

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir:'./uploads/books'});

var router = express.Router();

router.get('/bookgettest',BookController.bookgettest);
router.post('/savebook',md_auth.authenticated,BookController.savebook);
router.post('/uploadbookavatar/:id',[multipartMiddleware,md_auth.authenticated],BookController.uploadBookImage);
router.get('/getbookimage/:filename',BookController.getBookImage);
router.get('/getbook/:id',BookController.getBook);
router.get('/allbooks',BookController.getAllBooks);
router.get('/getbooks/:page?',BookController.getBooks);
router.put('/updatebook/:id',md_auth.authenticated,BookController.updateBook);
router.get('/searchbook/:search',BookController.search);
router.put('/setbookaslent/:id',BookController.setBookAsLent);
router.put('/setbookasfree/:id',BookController.setBookAsFree);



module.exports = router;
