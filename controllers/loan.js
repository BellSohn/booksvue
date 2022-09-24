'use strict'

const res = require("express/lib/response");
var Loan = require('../models/loan');
var Book = require('../models/book')
var validator = require('validator');
const book = require("../models/book");

var controller = {

testgetloan:function(req,res){
    return res.status(200).send({
        message:'testgetloan method evoked'
    });
},

saveloan:function(req,res){

    var reqParams = req.body;
    var user = req.user;
    var bookId = req.params.id;
    //console.log(reqParams);
    
    var validator_loandate = !validator.isEmpty(reqParams.loandate) && validator.isDate(reqParams.loandate);    
    var validator_returndate = !validator.isEmpty(reqParams.returndate) && validator.isDate(reqParams.returndate);  


    if(validator_loandate && validator_returndate){       

        var loan = new Loan();

        loan.loandate = reqParams.loandate;        
        loan.user = req.user.sub;        
        loan.returndate = reqParams.returndate;
		loan.status = 'activ';

        Book.findById({_id:bookId},(err,seekBook)=>{
            if(err || !seekBook){
                return res.status(500).send({
                    message:'Error al obtener datos del libro'
                });
            }
            var book = {
                isbn:seekBook.isbn,
                title:seekBook.title,
                author:seekBook.author,
                editorial:seekBook.editorial,
                year:seekBook.year,
				_id:seekBook._id
            }
            loan.books.push(book);
            loan.save((err,loanStored)=>{
                if(err || !loanStored){
                    return res.status(500).send({
                        message:'Error al tratar de guardar el prestamo'
                    });
                }
                return res.status(200).send({
                    loanStored
                });
            });
        });      
                      

    }else{
        return res.status(200).send({
            message:'los datos no son correctos'
        });
    }
    
},

endLoan:function(req,res){
	
	var loanId = req.params.id;
	
	var update = {
		status:'completed'
	}
	Loan.findOneAndUpdate({_id:loanId},update,{new:true},(err,loan)=>{
		if(err){
			return res.status(500).send({
				message:'Error al actualizar el estado del prestamo'
			});
		}
		if(!loan){
			return res.status(404).send({
				message:'No se pudo actualizar el prestamo'
			});
		}
		return res.status(200).send({
			loan
		});
	});	
	
	
},



updateLoanReturnDate:function(req,res){
    var loanId = req.params.id;
    var params = req.body;
	
	var returnD = params.returndate;
	var dateElements = returnD.split("-");
	//console.log(dateElements);
	var year = dateElements[0];
	var month = dateElements[1];
	var returnDay = dateElements[2];
	var day = returnDay.slice(0,2);
	var returndate = `${year}`+'-'+`${month}`+'-'+`${day}`;
	//console.log(year+"-"+month+"-"+day);
	//console.log(returndate);
	
    try{
        var validate_returndate = !validator.isEmpty(params.returndate);
        //var validate_status = !validator.isEmpty(params.status);
    }catch(error){
        return res.status(200).send({
            message:'error en los datos'
        });
    }  

    if(validate_returndate){

        var update = {
            //returndate:params.returndate,
			returndate:returndate
            
        }
        Loan.findOneAndUpdate({_id:loanId},update,{new:true},(err,loanUpdated)=>{
            if(err){
                return res.status(500).send({                    
                    message:'Error al actualizar',                    
                });
            }
            if(!loanUpdated){
                return res.status(404).send({
                    message:'Error, no se pudo actualizar el prestamo'
                });
            }
            return res.status(200).send({
                loanUpdated
            });
        });


    }else{
        return res.status(200).send({
            message:'Error,los datos no son correctos'
        });
    }    
	
},

getLoans:function(req,res){
	
	var options = {
        //sort:{loandate:-1},
		populate:'books',
        //limit:2,
        //page:1

	}
	
    Loan.paginate({},options,(err,loans)=>{
		if(err){
			return res.status(500).send({
				status:'error',
				message:'Error al sacar los prestamos'
			});
		}
		if(!loans){
			return res.status(404).send({
				status:'error',
				message:'No hay prestamos'				
			});
		}
		return res.status(200).send({
			status:'success',
			loans:loans.docs,

		});
	});
    
},

searchLoan:function(req,res){

    var busqueda = req.params.search;

    Loan.find({
        loandate:{busqueda}
    })
    .populate('user')    
    .exec((err,loans)=>{
        if(err){
            return res.status(500).send({
                status:'error',
                message:'Error en la busqueda',                
            });
        }
        if(!loans){
            return res.status(404).send({
                status:'error',
                message:'No se han encontrado datos'
            });
        }
        return res.status(200).send({
            status:'success',
            loans
        });
    });

    
},

getLoan:function(req,res){
    var loanId = req.params.id;
	Loan.findById(loanId)
	.populate('user')
	.populate('books')
	.exec((err,loan)=>{
		if(err){
			return res.status(500).send({
				status:'error',
				message:'Error al sacar los prestamos'
			});
		}
		if(!loan){
			return res.status(404).send({
				status:'error',
				message:'No hay prestamos'
			});
		}
		return res.status(200).send({
			status:'success',
			loan
		});
	});
    
}




}

module.exports = controller;