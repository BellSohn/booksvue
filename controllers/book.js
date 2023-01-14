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

        //set the object
        book.isbn = reqParams.isbn;
        book.title = reqParams.title;
        book.author = reqParams.author;
        book.editorial = reqParams.editorial;
        book.year = reqParams.year;
        book.pages = reqParams.pages;
        book.image = null;
		book.loaned = false;

        //check if it exists
        Book.findOne({isbn:reqParams.isbn},(err,issetBook)=>{
            if(err){
                return res.status(500).send({
                    message:'Error al buscar el libr0'
                });
            }
            if(!issetBook){
                //store the book in db
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
	
	
	
    try{
	var validate_isbn = !validator.isEmpty(params.isbn);
        var validate_title = !validator.isEmpty(params.title);
        var validate_author = !validator.isEmpty(params.author);
	var validate_editorial = !validator.isEmpty(params.editorial);        
        
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
	var filePath = req.files.file0.path;
	var file_split = filePath.split('\\');	
	var file_name = file_split[2];	
	var ext_split = file_name.split('\.');	
	var file_ext = ext_split[1];
        
    
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


getBookImage:function(req,res){
    
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

  //get the string we´re looing for
  var searchString = req.params.search;

  //find, but with an "or" operator
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
          //return result
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
