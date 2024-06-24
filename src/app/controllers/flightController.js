const Flight = require('../models/flight');
const Airport = require('../models/airport');
const Regulation = require('../models/regulation');
const flightValid = require('../../validation/flight');

class FlightController {
    // [GET] /flight/store
    store(req, res) {
        Flight.find()
            .then(flights => {
                flights = flights.map(flight => flight.toObject());

                const today = new Date();
                flights = flights.filter(flight => new Date(flight.date) > today);
                
                res.render('flight/store', { cssFile: 'layout.css', 
                                             showHeader: true,
                                             flights })
            })
    }

    // [GET] /flight/create
    create(req, res) {
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                const maxMidAirport = regulation.maxMidAirport;
                Airport.find()
                    .then(airports => {
                        airports = airports.map(airport => airport.toObject());
                        res.render('flight/create', { cssFile: 'flight.css', showHeader: true, airports, maxMidAirport });
                    })
            })
    }

    // [POST] /flight/create
    createFlight(req, res){
        req.body.date = new Date(req.body.date).toISOString().split('T')[0]
        const { flightId, price, startAirport, endAirport, date, time, flyTime, firstSeat, secondSeat, ...rest } = req.body;
        var midAirportsData = [];
        for (const key in rest) {
            if (key.startsWith('midAirport')) {
                const index = parseInt(key.replace('midAirport', ''));
                if (!midAirportsData[index]) {
                    midAirportsData[index] = {};
                }
                midAirportsData[index].name = rest[key];
            } 
            else if (key.startsWith('stopTime')) {
                const index = parseInt(key.replace('stopTime', ''));
                if (!midAirportsData[index]) {
                    midAirportsData[index] = {};
                }
                midAirportsData[index].stopTime = rest[key];
            } 
            else if (key.startsWith('note')) {
                const index = parseInt(key.replace('note', ''));
                if (!midAirportsData[index]) {
            midAirportsData[index] = {};
        }
                midAirportsData[index].note = rest[key];
            }
        }

        midAirportsData = midAirportsData.filter(midAirport => midAirport.name !== "")

        const flightData = {
            flightId,
            price,
            startAirport,
            endAirport,
            date,
            time,
            flyTime,
            firstSeat,
            secondSeat,
            midAirports: midAirportsData.length > 0 ? midAirportsData : undefined
        };

        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject(); 
                const minFlyTime = regulation.minFlyTime;
                const minStopTime = regulation.minStopTime;
                const maxStopTime = regulation.maxStopTime;
                const maxMidAirport = regulation.maxMidAirport;

                const flightValidation = flightValid(minFlyTime, minStopTime, maxStopTime);
                const valid = flightValidation.validate(flightData, { convert: true });

                Airport.find()
                    .then(airports => {
                        airports = airports.map(airport => airport.toObject())
                        if(valid.error) res.render('flight/create', { cssFile: 'flight.css', 
                                                                    showHeader: true,
                                                                    error: valid.error.details.map(detail => detail.message).join(', '),
                                                                    data: req.body,
                                                                    airports,
                                                                    maxMidAirport });
                        else{
                            Flight.findOne({ flightId : flightId })
                                .then(flight => {
                                    if(flight) res.render('flight/create', { cssFile: 'flight.css', 
                                                                            showHeader: true, 
                                                                            error: 'Trùng mã chuyến bay',
                                                                            data: req.body,
                                                                            airports,
                                                                            maxMidAirport });
                                    else {
                                        var error = null
                                        if(midAirportsData.some(midAirport => midAirport.name === startAirport)) error = 'Sân bay dừng trùng với sân bay đi';
                                        if(midAirportsData.some(midAirport => midAirport.name === endAirport)) error = 'Sân bay dừng trùng với sân bay đến';
                                        if(startAirport === endAirport) error = 'Sân bay đến trùng sân bay đi';

                                        if(error) {
                                            res.render('flight/create', { cssFile: 'flight.css', 
                                                showHeader: true,
                                                error,
                                                data: req.body,
                                                airports,
                                                maxMidAirport });
                                        }
                                        else {
                                            const newFlight = new Flight(valid.value);
                                            newFlight.save()
                                            res.redirect('/flight/store');
                                        }
                                    }
                                })
                        }
                    }) 
            })
        
    }

    // [DELETE] /flight/delete/:flightId
    deleteFlight(req, res) {
        const flightId = req.params.flightId;
        Flight.findOne({ flightId })
            .then(flight => {
                flight = flight.toObject();
                if(flight.emptyFirstSeat < flight.firstSeat || flight.emptySecondSeat < flight.secondSeat) {
                    Flight.find()
                        .then(flights => {
                            flights = flights.map(flight => flight.toObject());
                            res.render('flight/store', { cssFile: 'layout.css', 
                                                         showHeader: true,
                                                         flights,
                                                         flightIsBook: true })
                        })
                }
                else {
                    Flight.deleteOne({ flightId })
                        .then(() => res.redirect('back'))
                }
            })
    }

    // [GET] /flight/update/:flightId
    update(req, res) {
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                const maxMidAirport = regulation.maxMidAirport;
                Airport.find()
                    .then(airports => {
                        airports = airports.map(airport => airport.toObject())
                        
                        Flight.findOne({ flightId: req.params.flightId })
                            .then(flight => {
                                flight = flight.toObject();
                                res.render('flight/update', { cssFile: 'flight.css',
                                    showHeader: true,
                                    flight,
                                    airports,
                                    maxMidAirport })
                            })
                    })
            })
    }

    // [PUT] /flight/:flightId
    updateFlight(req, res) {
        const flightId = req.params.flightId;
        Flight.findOne({ flightId })
            .then(flight => {
                flight = flight.toObject();
                const startAirport = flight.startAirport;
                const endAirport = flight.endAirport;

                const { price, time, date, flyTime, firstSeat, secondSeat, ...rest } = req.body;
        
                var midAirportsData = [];
                for (const key in rest) {
                    if (key.startsWith('midAirport')) {
                        const index = parseInt(key.replace('midAirport', ''));
                        if (!midAirportsData[index]) {
                            midAirportsData[index] = {};
                        }
                        midAirportsData[index].name = rest[key];
                    } 
                    else if (key.startsWith('stopTime')) {
                        const index = parseInt(key.replace('stopTime', ''));
                        if (!midAirportsData[index]) {
                            midAirportsData[index] = {};
                        }
                        midAirportsData[index].stopTime = rest[key];
                    } 
                    else if (key.startsWith('note')) {
                        const index = parseInt(key.replace('note', ''));
                        if (!midAirportsData[index]) {
                    midAirportsData[index] = {};
                }
                        midAirportsData[index].note = rest[key];
                    }
                }

                midAirportsData = midAirportsData.filter(midAirport => midAirport.name !== "")

                const flightData = {
                    flightId,
                    price,
                    startAirport,
                    endAirport,
                    date,
                    time,
                    flyTime,
                    firstSeat,
                    secondSeat,
                    midAirports: midAirportsData.length > 0 ? midAirportsData : undefined
                };

               
                
                Regulation.findOne({})
                    .then(regulation => {
                        regulation = regulation.toObject(); 
                        const minFlyTime = regulation.minFlyTime;
                        const minStopTime = regulation.minStopTime;
                        const maxStopTime = regulation.maxStopTime;
                        const maxMidAirport = regulation.maxMidAirport;

                        const flightValidation = flightValid(minFlyTime, minStopTime, maxStopTime);
                        const valid = flightValidation.validate(flightData, { convert: true });

                        Airport.find()
                            .then(airports => {
                                airports = airports.map(airport => airport.toObject())
                                if(valid.error) res.render('flight/update', { cssFile: 'flight.css', 
                                                                            showHeader: true, 
                                                                            error: valid.error.details.map(detail => detail.message).join(', '),
                                                                            flight,
                                                                            airports,
                                                                            maxMidAirport });
                                else {
                                    Flight.updateOne({ flightId }, flightData)
                                        .then(res.redirect('/flight/store'))
                                }
                            }) 
                })
            })
    }
}

module.exports = new FlightController;