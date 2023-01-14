'use strict'

//requires
var express = require('express');
var bodyParser = require('body-parser');

//execute express
var app = express();

//files routes
var user_routes = require('./routes/user');
var book_routes = require('./routes/book');
var loan_routes = require('./routes/loan');

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS
// set headers and CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Rewrite routes
app.use('/api',user_routes);
app.use('/api',book_routes);
app.use('/api',loan_routes);

const fileUpload = require('express-fileupload');
app.use(fileUpload());


module.exports = app;
