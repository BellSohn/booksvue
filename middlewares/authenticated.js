'use strict'

var moment = require('moment');
var jwt = require('jwt-simple');
var secret = 'clave-secreta-para-generar-el-token-9999';

exports.authenticated = function(req,res,next){    
    if(!req.headers.authorization){
        return res.status(403).send({
            message:'request has not the authorization header'
        });
    }
    //limpiar el token
    var tokken = req.headers.authorization.replace(/['"]+/g,'');
    try{
        //decodificar el tokken
        var payload = jwt.decode(tokken,secret);
        //comprobar si el tokken ha expirado
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message:'El tokken ha expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({message:'El tokken no es valido'});
    }
    req.user = payload;
    next();
}