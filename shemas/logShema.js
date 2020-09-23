/*
* MongooseShema
*/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logsCron = new mongoose.Schema({
    date: Date,
    content: String,
    status: String
});

module.exports = mongoose.model('logsCron', logsCron);   