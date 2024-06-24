const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/education');
const Schema = mongoose.Schema;

const Airport = new Schema({
  name: { type: String }
});

module.exports = mongoose.model('Airport', Airport)
  