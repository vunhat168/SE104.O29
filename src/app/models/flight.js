const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/education');
const Schema = mongoose.Schema;

const Flight = new Schema({
  flightId: { type: String },
  price: { type: Number },
  startAirport: { type: String },
  endAirport: { type: String },
  date: { type: String },
  time: { type: String },
  flyTime: { type: Number },
  firstSeat: { type: Number },
  secondSeat: { type: Number },
  midAirports: [{
    name: String,
    stopTime: Number,
    note: String
  }],
  emptyFirstSeat: { type: Number },
  emptySecondSeat: { type: Number }
});

Flight.pre('save', function(next) {
  this.emptyFirstSeat = this.firstSeat;
  this.emptySecondSeat = this.secondSeat;
  next();
});

module.exports =  mongoose.model('Flight', Flight);