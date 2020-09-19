/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cronJobShema = new mongoose.Schema({
    "name": String,
    "frequency": Number,
    "type": String,
    "launching_date": Date
});

module.exports = mongoose.model('cronJobShema', cronJobShema);   