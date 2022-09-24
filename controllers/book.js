'use strict'

var validator = require('validator');
var Book = require('../models/book');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/book');

var controller = {

bookgettest:function(req,res){
    return res.status(200).send({
        message:'bookgettest method invoked'
    });
},

savebook:function(req,res){

      var reqParams  = req.body;
      var user = req.user;
      //console.log(reqParams);  
      if(user.role != 'admin' || user.role == undefined){
          return res.status(404).send({
              message:'Only administrators are allowed to store books'
          });
      }

      var validator_isbn = !validator.isEmpty(reqParams.isbn);
      var validator_title = !validator.isEmpty(reqParams.title);
      var validator_author = !validator.isEmpty(reqParams.author);
      var validator_editorial = !validator.isEmpty(reqParams.editorial);
      var validator_year  = !validator.isEmpty(reqParams.year) && validator.isInt(reqParams.year,{gt:1,lt:Date.now});
      var validator_pages = !validator.isEmpty(reqParams.pages) && validator.isInt(reqParams.pages,{gt:1});

      if(validator_isbn && validator_title && validator_author && validator_editorial && validator_year && validator_pages){

        var book = new Book();

        //setear el objeto
        book.isbn = reqParams.isbn;
        book.title = reqParams.title;
        book.author = reqParams.author;
        book.editorial = reqParams.editorial;
        book.year = reqParams.year;
        book.pages = reqParams.pages;
        book.image = null;
		book.loaned = false;

        //ver si ya existe
        Book.findOne({isbn:reqParams.isbn},(err,issetBook)=>{
            if(err){
                return res.status(500).send({
                    message:'Error al buscar el libr0'
                });
            }
            if(!issetBook){
                //guardamos el libro
                book.save(function(err,bookStored){
                    if(err || !bookStored){
                        return res.status(500).send({
                            message:'Error al guardar el libro'
                        });

                    }else{
                        return res.status(200).send({
                            bookStored
                        });
                    }
                });

            }else{
                return res.status(500).send({
                    message:'El libro ya esta registrado'
                });
            }

        });
    

      }else{
          return res.status(200).send({
              message:'Validacion de datos incorrecta'
          });
      }
    

},

updateBook:function(req,res){

    var bookId = req.params.id;
    var params = req.body;
	//console.log(params.title);
	
	
    try{
		var validate_isbn = !validator.isEmpty(params.isbn);
        var validate_title = !validator.isEmpty(params.title);
        var validate_author = !validator.isEmpty(params.author);
		var validate_editorial = !validator.isEmpty(params.editorial);
        //var validate_year = !validator.isEmpty(params.year);
        //var validate_pages = !validator.isEmpty(params.pages);
    }catch(err){
        return res.status(200).send({
			status:'error',
            message:'Los datos no son correctos'
        });
    }

    if(validate_isbn && validate_title && validate_author && validate_editorial ){
            var update = {
				isbn:params.isbn,
                title:params.title,
                author:params.author,
				editorial:params.editorial,
                year:params.year,
                pages:params.pages
            }
            Book.findOneAndUpdate({_id:bookId},update,{new:true},(err,bookUpdated)=>{
                if(err){
                    return res.status(500).send({
                        message:'Error al actualizar el libro'
                    });
                }
                return res.status(200).send({
                    bookUpdated
                });
            });
    }else{
        return res.status(200).send({
            message:'Problemas con los datos'
        });    
    }
	
    
},

uploadBookImage:function(req,res){

    var fileName = 'imagen no subida...';

    if(!req.files){
        return res.status(200).send({
            message:fileName
        })
    }
	//console.log(req.files.file0.path);
	var filePath = req.files.file0.path;
	//console.log(filePath);
	//console.log(filePath);
	var file_split = filePath.split('\\');
	//console.log(file_split);
	var file_name = file_split[2];
	//console.log(file_name);
	var ext_split = file_name.split('\.');
	//console.log(ext_split);
	var file_ext = ext_split[1];
	//console.log(file_ext);
    
    /*var filePath = req.files.file0.path;	
    var fileSplit = filePath.split("\\");	
    var fileName = fileSplit[2];	
    var fileExt = fileName.split(".")[1];*/
    
    if(file_ext != 'jpg' && file_ext != 'png' && file_ext != 'gif' && file_ext != 'jpeg'){
        fs.unlink(filePath,(err)=>{
            return res.status(200).send({
                status:'error',
                message:'La extension no es válida',
                extension:fileExt
            });
        });
    }else{
        var bookId = req.params.id;
        if(bookId){
			//console.log(fileName);
            Book.findByIdAndUpdate(bookId,{image:file_name},{new:true},(err,bookUpdated)=>{
                if(err){
                    return res.status(500).send({
                        message:'Error al subir la imagen'
                    });
                }
                if(!bookUpdated){   
                    return res.status(404).send({
                        message:'Error,el libro no se actualizo'
                    });
                }
                return res.status(200).send({
                    bookUpdated
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

/*
uploadBookImage:function(req,res){

    var bookId = req.params.id;
    var EdFile = req.files.file0;
    
    var fileName = EdFile.name;
    var fileType = EdFile.mimetype;
    var fileExt = fileType.split('/')[1];
    
    EdFile.mv(`./uploads/books/${fileName}`,err=>{
        if(err){
            return res.status(500).send({
                message:err
            });
        }
        if(fileExt != 'jpg' && fileExt != 'png' && fileExt != 'jpeg' && fileExt != 'gif'){
            fs.unlink(fileName,(err)=>{
                return res.status(200).send({
                    status:'error',
                    message:'file extension is not valid'
                })
            });

        }else{            
            Book.findOneAndUpdate({_id:bookId},{image:fileName},{new:true},(err,bookUpdated)=>{
                if(err || !bookUpdated){
                    return res.status(500).send({
                        status:'error',
                        message:'Error al intentar subir la imagen del libro'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    bookUpdated
                });

            });

        }
    });
   
},
*/
getBookImage:function(req,res){

    //var bookId = req.params.id;
    var imageName = req.params.filename;
    var pathFile = 'uploads/books/'+imageName;
    fs.exists(pathFile,(exists)=>{
        if(exists){
            return res.sendFile(path.resolve(pathFile));
        }else{
            return res.status(404).send({
                message:'Error al recibir el archivo',
                pathFile
            });
        }
    });    

},

getBook:function(req,res){
    var bookId = req.params.id;

    Book.findOne({_id:bookId},(err,book)=>{
        if(err){
            return res.status(500).send({
                message:'El libro no existe'
            });
        }
		if(!book){
			return res.status(404).send({
				message:'No se encontro el libro'
			});
		}
        return res.status(200).send({
            book
        });
    });    
},

setBookAsLent:function(req,res){
	
	var bookId = req.params.id;
	var update = {loaned:true}
	Book.findOneAndUpdate({_id:bookId},update,{new:true},(err,book)=>{
		if(err){
			return res.status(500).send({
				message:'El libro no existe'
			});
		}
		return res.status(200).send({
			//book:book.loaned = true,
			book
		});
	});	
	
},

setBookAsFree:function(req,res){
	
	var bookId = req.params.id;
	var update = {loaned:false}
	Book.findOneAndUpdate({_id:bookId},update,{new:true},(err,book)=>{
		if(err){
			return res.status(500).send({
				message:'Error al actualizar el libro'
			});
		}
		if(!book){
			return res.status(404).send({
				message:'No se ha encontrado el libro'
			});
		}
		return res.status(200).send({
			book
		});
		
	});	
	
},

search:function(req,res){

  //sacar el string a buscar
  var searchString = req.params.search;

  //find, pero con un operador or
  Book.find({
      "$or":[
      {"title":{"$regex":searchString,"$options":"i"}},
      {"author":{"$regex":searchString,"$options":"i"}},   
     
      ]}) 
        
      .exec((err,books)=>{
          if(err){
              return res.status(500).send({
                  status:'error',
                  searchString,
                  message:'Error en la peticion'
              });
          }

          if(!books){
              return res.status(404).send({
                  status:'error',
                  message:'No hay temas disponibles'
              });
          }
          //devolver el resultado
           return res.status(200).send({
              status:'success',
              books
          });

      });
   
},

getBooks:function(req,res){

    //Pagination
    if(req.params.page || req.params.page == 0 || req.params.page == "0" || 
    req.params.page == null || req.params.page == undefined){
        var page = 1;
    }else{
        var page = parseInt(req.params.page);
    }

    var options = {
        limit:5,
        page:page
    }

    Book.paginate({},options,(err,books)=>{
        if(err){
            return res.status(500).send({
                message:'error en la books request'
            });
        }
        return res.status(200).send({
            books
        });
    });
    
},

getAllBooks:function(req,res){
	
	Book.find((err,books)=>{
		if(err){
			return res.status(500).send({
				message:'error al obtener los libros'
			});
		}
		if(!books){
			return res.status(404).send({
				message:'no se encontraron libros'
			});
		}
		return res.status(200).send({
			books
		});
	});
	
	
}






}
module.exports = controller;