const { ref } = require('joi');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/education');
const Schema = mongoose.Schema;

const Ticket = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', require: true },
  flight: { type: Schema.Types.ObjectId, ref: 'Flight', require: true},
  passenger: { type: String, require: true },
  CMND: { type: String, require: true},
  phoneNumber: { type: String, require: true},
  ticketRank: { type: Number, require: true},
  price: { type: Number, require: true },
});

module.exports = mongoose.model('Ticket', Ticket)
  