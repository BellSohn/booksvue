'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');


exports.createToken = function(user){
    var payload = {
        sub:user._id,
        name:user.name,
        surname:user.surname,
        email:user.email,
        image:user.image,
        address:user.address,
        age:user.age,
        role:user.role
    }

    return jwt.encode(payload,'clave-secreta-para-generar-el-token-9999');
}


