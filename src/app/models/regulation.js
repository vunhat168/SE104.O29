const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/education');
const Schema = mongoose.Schema;

const Regulation = new Schema({
    minFlyTime: { type: Number, default: 30 },
    maxMidAirport: { type: Number, default: 2 },
    minStopTime: { type: Number, default: 10 },
    maxStopTime: { type: Number, default: 20 },
    minBookingTime: { type: Number, default: 24 },
    minDeleteMyFlightTime: { type: Number, default: 0 },
});

module.exports =  mongoose.model('Regulation', Regulation);