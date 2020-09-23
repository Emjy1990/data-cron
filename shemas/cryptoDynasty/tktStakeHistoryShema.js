/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tktStackHistory = new mongoose.Schema({
    staked: Number,
    lpest_staked: Number,
    unstaking: Number,
    date: Date
});

module.exports = mongoose.model('tktStackHistory', tktStackHistory);   