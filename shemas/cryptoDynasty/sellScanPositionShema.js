/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SellScanPosition = new mongoose.Schema({
    direction : String,
    position : Number
});

module.exports = mongoose.model('SellScanPosition', SellScanPosition);   