'use strict'

var express = require('express');
var UserController = require('../controllers/user');

//Middlewares
var md_auth = require('../middlewares/authenticated');

//Para cargar archivos de imagen
//var fileUpload = require('express-fileupload');
//var md_upload = fileUpload();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir:'./uploads/users'});

var router = express.Router();

router.get('/pruebaget',UserController.probandoget);
router.post('/pruebapost',UserController.probandoPost);
router.post('/saveuser',UserController.saveUser);
router.post('/login',UserController.login);
router.post('/logindata',UserController.loginData);
router.put('/updateuser',md_auth.authenticated,UserController.updateUser);
router.post('/uploadavatar/:id?',[multipartMiddleware],UserController.uploadAvatar);
router.get('/get-image/:filename',UserController.getImage);
router.get('/getuser/:id',UserController.getUser);
router.get('/getusers',UserController.getUsers);
router.get('/searchuser/:search',UserController.searchUser);

module.exports = router;