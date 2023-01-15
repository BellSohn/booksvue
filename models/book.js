'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

var BookSchema = Schema({    
    isbn:String,
    title:String,
    author:String,
    editorial:String,
    year:Number,
    pages:Number,
    image:String,
	loaned:Boolean
});

//load pagination
BookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book',BookSchema);
