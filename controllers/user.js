'use strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt');
var jwt = require('../services/jwt');
const res = require('express/lib/response');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/user');

var saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);



var controller = {

probandoget:function(req,res){
    return res.status(200).send({
        message:'Método get desde el controlador de usuario'
    });
},

probandoPost:function(req,res){
    return res.status(200).send({
        message:'Método post desde el controlador de usuario'
    });
},

saveUser:function(req,res){

    var params = req.body;
    console.log(params);
    var validate_name = !validator.isEmpty(params.name);
    var validate_surname = !validator.isEmpty(params.surname);
    var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    var validate_password = !validator.isEmpty(params.password);
    var validate_address = !validator.isEmpty(params.address);
    var validate_age = !validator.isEmpty(params.age);
    var validate_role = !validator.isEmpty(params.role);

    if(validate_name && validate_surname && validate_email && validate_password && validate_address && validate_age && validate_role){

        var user = new User();

        //set the object
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email.toLowerCase();
        user.password = params.password;
        user.address = params.address;
        user.age = params.age;
        user.role = params.role;
        user.image = null;

        //check if the user exists
        User.findOne({email:user.email},(err,issetUser)=>{
            if(err){
                return res.status(500).send({
                    message:'Error while checking user duplicity'
                });
            }
            if(!issetUser){
                //store the user in Mongo
                bcrypt.hash(params.password,salt,(err,hash)=>{
                    user.password = hash
                    user.save((err,userStored)=>{
                        if(err){
                            return res.status(500).send({
                                message:'Error while trying to store the user'
                            });
                        }
                        if(!userStored){
                            return res.status(404).send({
                                message:'Error,the user cant be stored'
                            });
                        }
                        return res.status(200).send({
                            message:'user stored',
                            userStored
                        });    
                    });
                });               

            }else{                
                return res.status(500).send({
                    message:'The user is already registered'
                });
            }
        });        

    }else{
        return res.status(200).send({
            message:'Error,the validation was not correct'
        });
    }
    
},



login:function(req,res){
    var loginParams = req.body;   

    var validate_email = !validator.isEmpty(loginParams.email) && validator.isEmail(loginParams.email);
    var validate_password = !validator.isEmpty(loginParams.password);

    if(!validate_email && !validate_password){
        return res.status(200).send({
            message:'Error, introduced data is not correct,try it again'
        });
    }else{
        User.findOne({email:loginParams.email.toLowerCase()},(err,userStored)=>{
            if(err){
                return res.status(500).send({
                    message:'Error,while login'
                });
            }
            if(!userStored){
                return res.status(404).send({
                    message:'The email was not found'
                });
            }
            bcrypt.compare(loginParams.password,userStored.password,function(err,check){
               if(check){
                   if(loginParams.tokken){
                        return res.status(200).send({
                            status:'success',
                            tokken:jwt.createToken(userStored)
                        });
                   }else{
                       return res.status(200).send({
                           status:'success',
                           userStored
                       });
                   }
               }else{
                   userStored.password = undefined;
                   return res.status(404).send({
                       status:'error',
                       message:'Error, the email or the password are not correct' 
                   });
                    
               }

            });
        });
    }
    
},

loginData:function(req,res){
	
	var loginParams = req.body;
	
	var validate_email = !validator.isEmpty(loginParams.email)&& validator.isEmail(loginParams.password);
	var validate_password = !validator.isEmpty(loginParams.password);
	
	if(!validate_email && !validate_password){
		return res.status(200).send({
			message:'Error, introduced data is not correct, try it again'
		});
		
	}else{
		User.findOne({email:loginParams.email.toLowerCase()},(err,userStored)=>{
			if(err){
				return res.status(500).send({
					message:'Error al intentar el login'
				});
			}
			if(!userStored){
				return res.status(404).send({
					message:'Error no se encontraron datos'
				});
			}
			bcrypt.compare(loginParams.password,userStored.password,function(err,check){
				if(check){
					return res.status(200).send({
						status:'success',
						userStored
					});
				}else{
					userStored.password = undefined;
					return res.status(404).send({						
						status:'error',
						message:'Error,el email o el password no son correctos'	
					});					
					
				}
				
			});
		});	
			
	}
	
	
},

updateUser:function(req,res){
    var reqParams = req.body;
    //console.log(reqParams);
	
    try{
        var validate_name = !validator.isEmpty(reqParams.name);
        var validate_surname = !validator.isEmpty(reqParams.surname);
        var validate_email = !validator.isEmpty(reqParams.email) && validator.isEmail(reqParams.email);
        var validate_address = !validator.isEmpty(reqParams.address);        
    }catch(err){
        return res.status(200).send({
			status:'error',
            message:'Error, faltan datos'
        });
    }
    
    var userId = req.user.sub;
	//console.log(userId);
	
	
    if(validate_name && validate_surname && validate_email && validate_address){
		var update = {
			name:reqParams.name,
			surname:reqParams.surname,
			email:reqParams.email,
			address:reqParams.address,
			age:reqParams.age
		}
		//console.log(update);
		
        if(req.user.email != reqParams.email){

            User.findOne({email:reqParams.email.toLowerCase()},(err,user)=>{
                if(err){
                    return res.status(500).send({
                        message:'Error, al intentar identificarse'
                    });
                }
                if(user && user.email == reqParams.email){
                    return res.status(200).send({
                        message:'El email no puede ser modificado'
                    });

                }else{
                    // Article.findByIdAndUpdate(articleId,params,{new:true},(err,updatedArticle)=>{
                    User.findOneAndUpdate({_id:userId},update,{new:true},(err,userUpdated)=>{
                        if(err){
                            return res.status(500).send({
                                message:'Error al intentar actualizar el usuario'
                            });
                        }
                        if(!userUpdated){
                            return res.status(404).send({
                                message:'Error, no se puedo actualizar el usuario'
                            });
                        }
                        return res.status(200).send({
                            userUpdated
                        });
                    });
                }
            });

        }else{            
            User.findOneAndUpdate({_id:userId},update,{new:true},(err,userUpdated)=>{
                if(err){
                    return res.status(500).send({
                        message:'Error al intentar actualizar el usuario'
                    });
                }
                if(!userUpdated){
                    return res.status(404).send({
                        message:'Error, el usuario no se pudo actualizar'
                    });
                }
                return res.status(200).send({
                    userUpdated
                });
            });
        }
		

    }else{
        return res.status(404).send({
            message:'Error, something happened with the data'
        });
    } 
	
	
},

uploadAvatar:function(req,res){
	
	var fileName = 'imagen no subida...';
	if(!req.files){
		return res.status(200).send({
			message:fileName
		});
	}
	var filePath = req.files.file0.path;
	//console.log(filePath);
	var file_split = filePath.split('\\');
	//console.log(file_split);
	var file_name = file_split[2];
	//console.log(file_name);
	var file_ext = file_name.split('\.')[1];
	//console.log(file_ext);
	if(file_ext != 'jpg' && file_ext != 'png' && file_ext != 'gif' && file_ext != 'jpeg'){
			fs.unlink(filePath,(err)=>{
				return res.status(200).send({
					status:'error',
					message:'La extension no es valida',
					extension:file_ext
				});
			});
		
	}else{
		var userId = req.params.id;
		if(userId){
			User.findByIdAndUpdate(userId,{image:file_name},{new:true},(err,userUpdated)=>{
			if(err){
				return res.status(500).send({
					status:'error',
					message:'Error al subir la imagen'
				});
			}
			if(!userUpdated){
				return res.status(404).send({
					status:'error',
					message:'El usuario no se actualizo'
				});				
			}
			return res.status(200).send({
				status:'success',
				userUpdated
			});
			
			
		});
			
		}else{
			return res.status(200).send({
				status:'success',
				file_name
			});		
		}
		
	}
	
	
},

/*uploadAvatar:function(req,res){

    var EdFile = req.files.file0;
    var fileName = EdFile.name;
    var mimeType = EdFile.mimetype;
    var fileType = mimeType.split('/')[1];
    console.log(fileType);
	
    EdFile.mv(`./uploads/users/${fileName}`,err =>{
        if(err){
            return res.status(500).send({
                message:err
            });
        }
        if(fileType != 'png' && fileType != 'jpg' && fileType != 'jpeg' && fileType != 'gif'){
            fs.unlink(fileName,(err)=>{
                return res.status(200).send({
                    status:'error',
                    message:'file extension is not valid'
                });
            });

        }else{

            var userId = req.user.sub;
            User.findOneAndUpdate({_id:userId},{image:fileName},{new:true},(err,userUpdated)=>{
                if(err || !userUpdated){
                    return res.status(500).send({
                        status:'error',
                        message:'Error while trying to upload file'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    userUpdated
                });
            });

        }

    });
    
},
*/

getImage:function(req,res){

    var imageName = req.params.filename;
    var pathFile = 'uploads/users/'+imageName;

    fs.exists(pathFile,(exists)=>{
        if(exists){
            return res.sendFile(path.resolve(pathFile));
        }else{
            return res.status(404).send({
                message:'error al recibir el archivo',
                pathFile
            });
        }
    });
  
},

searchUser:function(req,res){
    var searchString = req.params.search;

    User.find({
        "$or":[
            {"name":{"$regex":searchString,"$options":"i"}},
            {"surname":{"$regex":searchString,"$options":"i"}},
            {"email":{"$regex":searchString,"$options":"i"}},
            {"address":{"$regex":searchString,"$options":"i"}}
        ]})
        .exec((err,users)=>{
            if(err){
                return res.status(500).send({
                    message:'Error al buscar usuarios',                    
                });
            }
            if(!users){
                return res.status(404).send({
                    message:'No hay resultados'
                });
            }
            return res.status(200).send({
                users
            });
        }); 

    
},

getUser:function(req,res){
    var userId = req.params.id;
    User.findById(userId,(err,user)=>{
        if(err || !user){
            return res.status(500).send({
                message:'Error al solicitar datos del usuario'
            });
        }
        return res.status(200).send({
            status:'success',
            user
        });
    });
    
},

getUsers:function(req,res){

    User.find().exec((err,users)=>{
        if(err){
            return res.status(500).send({
                message:'Error en la solicitud de usuarios'
            });
        }
        return res.status(200).send({
            users
        });
    });
   
}




}
module.exports = controller;