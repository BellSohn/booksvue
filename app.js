'use strict'

//requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar express
var app = express();

//archivos de rutas
var user_routes = require('./routes/user');
var book_routes = require('./routes/book');
var loan_routes = require('./routes/loan');

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS
// Configurar cabeceras y cors
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

//test methods
/*
app.get('/pruebaget',(req,res)=>{
    return res.status(200).send({
        nombre:'Mario',
        surname:'Bellsola'
    });
});
*/

/*
app.post('/pruebapost',(req,res)=>{
    return res.status(200).send({
        message:'Este es el texto del post'
    });
});

app.post('/parametrosbody',(req,res)=>{
    //console.log(req.body);
    var bodyParams = req.body;
    var name = bodyParams.name;
    var surname = bodyParams.surname;
    return res.status(200).send({
        message:'peticion params',
        name:name,
        surname:surname
    });
});

app.post('/valorurl',(req,res)=>{
    var urlParams = req.query.valor
    console.log(urlParams);
    return res.status(200).send({
        message:'parametros por url'
    });
});

app.post('/valorsegmentourl/:id',(req,res)=>{
    var valorsegmento = req.params.id;
    console.log(valorsegmento);
    return res.status(200).send({
        message:'parametro por segmento'
    });
});
*/

module.exports = app;