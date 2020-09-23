/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var poolRewardTKT = new mongoose.Schema({
    total_eos : Number,
    dividend_time : Number
});

module.exports = mongoose.model('poolRewardTKT', poolRewardTKT);   