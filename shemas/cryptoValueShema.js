/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cryptoValue = new mongoose.Schema({
    symbol_crypto: String,
    symbol_fiat: String,
    date: Date,
    fiat_value : Number,
});

module.exports = mongoose.model('cryptoValue', cryptoValue);   