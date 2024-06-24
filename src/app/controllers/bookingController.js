const Airport = require('../models/airport');
const Flight = require('../models/flight');
const Ticket = require('../models/ticket');
const Regulation = require('../models/regulation');

class BookingController {
    // [GET] /booking
    getInfo(req, res) {
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                const minBookingTime = regulation.minBookingTime;
                Airport.find()
                    .then(airports => {
                            airports = airports.map(airport => airport.toObject());
                            Flight.find()
                                .then(flights => {
                                    flights = flights.map(flights => flights.toObject());
                                    const today = new Date();
                                    flights = flights.filter(flight => {
                                        var flyTime = new Date(`${flight.date}T${flight.time}`);
                                        var bookingTime = (flyTime - today) / (1000 * 60 * 60);
                                        return bookingTime > minBookingTime && flight.emptyFirstSeat + flight.emptySecondSeat > 0;
                                    });

                                    res.render('booking/bookFlight', { cssFile: 'book.css', showHeader: true , airports, flights});
                                })
                            
                    })
            })
    }

    // [POST] /booking
    search(req, res) {
        Airport.find()
            .then(airports => {
                airports = airports.map(airport => airport.toObject());
                req.body.date = new Date(req.body.date).toISOString().split('T')[0]
                const { startAirport, endAirport, date } = req.body;
                Flight.find({ startAirport, endAirport, date })
                    .then(flights => {
                        flights = flights.map(flights => flights.toObject());
                        res.render('booking/bookFlight', { cssFile: 'book.css', showHeader: true , airports, flights});
                    })
            })
        
    }

    // [GET] /booking/ticket
    book(req, res) {
        const user = req.session.user;
        Flight.findById(req.query.ID)
            .then(flight => {
                flight = flight.toObject();
                res.render('booking/ticket', { cssFile: 'flight.css', showHeader: true, flight })
            })
    }

    // [POST /booking/ticket
    createTicket(req, res) {
        const user = req.session.user
        const userId = user._id
        const { passenger, CMND, phoneNumber, ticketRank } = req.body;

        const updateFields = {
            $inc: {}
        };

        if (ticketRank === '1') {
            updateFields.$inc.emptyFirstSeat = -1;
        } 
        else if (ticketRank === '2') {
            updateFields.$inc.emptySecondSeat = -1;
        }
          
        Flight.findById(req.query.ID)
            .then(flight => {
                flight = flight.toObject();
                if(ticketRank === '1' && flight.emptyFirstSeat <= 0) {
                    return res.render('booking/ticket', { cssFile: 'flight.css', showHeader: true, flight, error: 'Hết ghế hạng 1', data: req.body })
                }
                else if(ticketRank === '2' && flight.emptySecondSeat <= 0) {
                    return res.render('booking/ticket', { cssFile: 'flight.css', showHeader: true,  flight, error: 'Hết ghế hạng 2', data: req.body })
                }
                else{
                    return Flight.findByIdAndUpdate(req.query.ID, updateFields, {new: true})
                }
            })
            .then(flight => {
                if(flight){
                    const ticket = new Ticket({
                        user: userId,
                        flight: flight._id,
                        passenger,
                        CMND,
                        phoneNumber,
                        ticketRank,
                        price: ticketRank === '1' ? Math.floor(flight.price * 1.05) : flight.price,
                    })
                    ticket.save();
    
                    res.redirect('/customer/myFlight')
                }
            })
    }
}

module.exports = new BookingController;