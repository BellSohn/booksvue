'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate-v2');

//book model
var BookSchema = Schema({
    isbn:String,
    title:String,
    author:String,
    editorial:String
});

var LoanSchema = Schema({
loandate:{type:Date,default:Date.now},
user:{type:Schema.ObjectId,ref:'User'},
books:[BookSchema],
returndate:{type:Date,default:Date.now},
status:String
});

//load pagination
LoanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Loan',LoanSchema);
