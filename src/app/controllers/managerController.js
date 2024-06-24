const User = require('../models/user')
const Flight = require('../models/flight')
const Regulation = require('../models/regulation')
const regulationValid = require('../../validation/regulation');

class ManagerController {
    // [GET] /manager/login
    login(req, res) {
        res.render('manager/login', { cssFile: 'auth.css', showHeader: false });
    }

    // [POST] /manager/login
    checkManager(req, res, next) {
        const { email, password } = req.body;

        User.findOne({ email })
            .then(user => {
                if(user && user.role === 'manager') {
                    if(user.password === password) {
                        req.session.user = user;
                        res.redirect('/')
                    }
                    else res.render('manager/login', { cssFile: 'auth.css', error: 'Sai mật khẩu', data: req.body })
                }
                else res.render('manager/login', { cssFile: 'auth.css', error: 'Không tìm thấy thông tin manager', data: req.body })
            })
            .catch(next)
    }

    // [GET] /manager/report
    report(req, res) {
        res.render('manager/report', { cssFile: 'book.css', showHeader: true })
    }

    // [POST] /manager/report
    getReport(req, res) {
        const { reportType, month, year } = req.body;
        if(reportType === 'month') {
            Flight.find({ date: { $regex: `^${month}` } })
                .then(flights => {
                    var totalIncome = 0
                    flights = flights.map(flight => {
                        flight = flight.toObject();
                        const bookFisrtSeat = flight.firstSeat - flight.emptyFirstSeat;
                        const bookSecondSeat =  flight.secondSeat - flight.emptySecondSeat;
                        flight.ticket = bookFisrtSeat + bookSecondSeat;
                        flight.income =  bookFisrtSeat * Math.floor(flight.price * 1.05) + bookSecondSeat * flight.price;
                        totalIncome += flight.income;
                        return flight;
                    })
                    flights = flights.map(flight => {
                        flight.percent = (flight.income / totalIncome) * 100;
                        flight.percent = flight.percent.toFixed(2)
                        return flight;
                    })
                    res.render('manager/report',  { cssFile: 'book.css', 
                                                    showHeader: true, 
                                                    flights, 
                                                    reportType,
                                                    month })
                })
        }

        if(reportType === 'year') {
            Flight.find({ date: { $regex: `^${year}` } })
                .then(flights => {
                    flights = flights.map(flight => flight.toObject());
                    
                    var totalIncome = 0;

                    const flightByMonth = flights.reduce((acc, flight) => {
                        const month = flight.date.split('-')[1];
                        const bookFisrtSeat = flight.firstSeat - flight.emptyFirstSeat;
                        const bookSecondSeat =  flight.secondSeat - flight.emptySecondSeat;

                        const income =  bookFisrtSeat * Math.floor(flight.price * 1.05) + bookSecondSeat * flight.price;
                        totalIncome += income;

                        const currentInfo = acc.find(info => info.month === month)
                        if(!currentInfo) {
                            acc.push({ month, flightCount: 1, income })
                        }
                        else {
                            currentInfo.flightCount += 1;
                            currentInfo.income += income;
                        }
                        return acc;
                    }, [])

                    flightByMonth.map(info => {
                        info.percent = info.income / totalIncome * 100;
                        info.percent = info.percent.toFixed(2)
                        return info;   
                    })
                    
                    res.render('manager/report',  { cssFile: 'book.css', 
                                                    showHeader: true, 
                                                    flightByMonth, 
                                                    reportType,
                                                    year })
                })
        }
    }

    // [GET] /manager/regulation
    regulation(req, res) {
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                res.render('manager/regulation', { cssFile: 'layout.css', showHeader: true, regulation })
            })
    }

    // [POST] /manager/regulation
    changeRegulation(req, res) {
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                var newRegulation = { ...regulation };
                delete newRegulation._id
                delete newRegulation.__v
                for (let key in req.body) newRegulation[key] = req.body[key]
                const valid = regulationValid.validate(newRegulation);
                if(valid.error) res.render('manager/regulation', { cssFile: 'layout.css', 
                                                                  showHeader: true,
                                                                  regulation,
                                                                  error: valid.error.details.map(detail => detail.message).join(', ') });
                else {
                    Regulation.updateOne({}, { $set: req.body })
                        .then(() => res.redirect('/manager/regulation'))
                }
            })
    }
}

module.exports = new ManagerController;