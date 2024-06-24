const { response } = require('express')
const Airport = require('../models/airport')
const Flight = require('../models/flight')

class FlightController {
    // [GET] /airport/store
    store(req, res) {
        Airport.find()
            .then(airports => {
                airports = airports.map(airport => airport.toObject())
                res.render('airport/store', { cssFile: 'layout.css', 
                                              showHeader: true,
                                              airports })
            })
    }

    // [POST] /airport/store
    create(req, res) {
        Airport.findOne({ name: req.body.name })
            .then(airport => {
                if(!airport) {
                    const newAirport = new Airport(req.body);
                    newAirport.save();
                }
                res.redirect('/airport/store');
            })
    }

    // [DELETE] /airport/delete/:name
    deleteAirport(req, res) {
        const airport = req.params.name
        Airport.find()
            .then(airports => {
                airports = airports.map(airport => airport.toObject())
                Flight.findOne({ $or: [{ startAirport: airport }, { endAirport: airport }] })
                    .then(flight => {
                        if(flight) {
                            res.render('airport/store', { cssFile: 'layout.css', 
                                                        showHeader: true,
                                                        airports,
                                                        deleteAirport: true})
                        }
                        else {
                            Airport.deleteOne({ name: airport })
                                .then(() => res.redirect('back'))
                        }
                    })
            }) 
    }
}

module.exports = new FlightController;