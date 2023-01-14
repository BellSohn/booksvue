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
    //clean the tokken
    var tokken = req.headers.authorization.replace(/['"]+/g,'');
    try{
        //decode the tokken
        var payload = jwt.decode(tokken,secret);
        //check if the tokken has expired
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
