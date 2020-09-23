/*
* MongooseShema
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Sell = new mongoose.Schema({
    type: String,
    id_element: String,
    date: Date,
    amount: Number,
    seller: String,
    buyer: String,
    id_sale: String,
    pos : Number
});

module.exports = mongoose.model('Sell', Sell);   