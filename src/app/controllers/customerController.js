const User = require('../models/user')
const Ticket = require('../models/ticket') 
const Flight = require('../models/flight') 
const Regulation = require('../models/regulation') 

class CustomerController {
    // [GET] /customer/login
    login(req, res) {
        res.render('customer/login', { cssFile: 'auth.css', showHeader: false });
    }
    
    // [GET] /customer/signup
    signup(req, res) {
        res.render('customer/signup', { cssFile: 'auth.css', showHeader: false })
    }
    // [POST] /customer/signup
    createCustomer(req, res, next) {
        const { name, email, password, confirmPassword } = req.body;
        const emailRegex = /^[^\s@]+@gmail\.com$/;
        if(!emailRegex.test(email)) res.render('customer/signup', { cssFile: 'auth.css', error: 'Email không hợp lệ', data: req.body });
        else if(password !== confirmPassword) res.render('customer/signup', { cssFile: 'auth.css', error: 'Mật khẩu xác nhận không đúng', data: req.body });
        else{
            User.findOne({ email })
                .then(user => {
                    if(user) res.render('customer/signup', { cssFile: 'auth.css',error: 'Email đã tồn tại', data: req.body })
                    else{
                        const user = new User({ name, email, password });
                        user.role = 'customer';
                        user.save();
                        res.redirect('/customer/login');
                    }
                })
                .catch(next)
        }
    }

    // [POST] /customer/login
    checkCustomer(req, res, next) {
        const { email, password } = req.body;

        User.findOne({ email })
            .then(emailUser => {
                if(emailUser) {
                    User.findOne({ email, password })
                        .then(passUser => {
                            if(passUser && passUser.role === 'customer'){
                                req.session.user = passUser;
                                res.redirect('/')
                            }
                            else res.render('customer/login', { cssFile: 'auth.css', error: 'Sai mật khẩu', data: req.body })
                        })
                        .catch(next)
                }
                else res.render('customer/login', { cssFile: 'auth.css', error: 'Không tìm thấy thông tin người dùng', data: req.body })
            })
            .catch(next)
    }

    logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/');
            }
            res.clearCookie('connect.sid'); // Tên cookie mặc định của express-session
            res.redirect('/');
        });
    }

    // [GET] /customer/myFlight
    showMyFlight(req, res) {
        const user = req.session.user;
        const userId = user._id
        const today = new Date().toISOString().split('T')[0]; 
        Regulation.findOne({})
            .then(regulation => {
                regulation = regulation.toObject();
                const minDeleteMyFlightTime = regulation.minDeleteMyFlightTime

                Ticket.find({ user: userId })
                    .populate('flight')
                    .exec()
                    .then(tickets => {
                        tickets = tickets.map(ticket => ticket.toObject());
                        const today = new Date();

                        tickets = tickets.filter(ticket => new Date(`${ticket.flight.date}T${ticket.flight.time}`) > today)

                        const canCancelTickets = tickets.filter(ticket => {
                            var flyTime = new Date(`${ticket.flight.date}T${ticket.flight.time}`);
                            var cancelTime = (flyTime - today) / (1000 * 60 * 60);
                            return cancelTime >= minDeleteMyFlightTime;
                        })

                        const notCancelTickets = tickets.filter(ticket => {
                            var flyTime = new Date(`${ticket.flight.date}T${ticket.flight.time}`);
                            var cancelTime = (flyTime - today) / (1000 * 60 * 60);
                            return cancelTime < minDeleteMyFlightTime;
                        })
                        const Tickets = tickets.filter(ticket => ticket.flight.date < today);
                        res.render('customer/myFlight', { cssFile: 'layout.css', showHeader: true, canCancelTickets, notCancelTickets });
                    })
            })
    }

    // [DELETE] /customer/myFlight/:id/:ticketRank
    deleteMyFlight(req, res) {
        const { id, ticketRank } = req.params
        
        const updateFields = {
            $inc: {}
        };

        if (ticketRank === '1') {
            updateFields.$inc.emptyFirstSeat = 1;
        } 
        else if (ticketRank === '2') {
            updateFields.$inc.emptySecondSeat = 1;
        }
        
        Ticket.findOne({ _id: id })
            .populate('flight')
            .exec()
            .then(ticket => {
                ticket = ticket.toObject();
                return Flight.findByIdAndUpdate(ticket.flight._id, updateFields, {new: true})
            })
            .then(flight => {
                return Ticket.deleteOne({ _id: id })
            })
            .then(() => res.redirect('back'))
    }
}

module.exports = new CustomerController;