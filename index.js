'use strict'

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.connect('mongodb://localhost:27017/bookbackend',{useNewUrlParser:true})
.then(()=>{
    console.log('conexion with mongo successfully stablished')
    //crear el servidor
    app.listen(port,()=>{
        console.log('server http://localhost:3999 working');
    });
})
.catch(error => console.log(error));
