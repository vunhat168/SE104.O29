const customerRouter = require('./customer')
const managerRouter = require('./manager')
const adminRouter = require('./admin')
const flightRouter = require('./flight')
const airportRouter = require('./airport')
const bookingRouter = require('./booking')
const Regulation = require('../app/models/regulation')

function route(app) {
    app.use(function(req, res, next) {
        if (req.session.user) {
            res.locals.userLogin = req.session.user;
            res.locals.isAdmin = req.session.user.role === 'admin';
            res.locals.isManager = req.session.user.role === 'manager';

            Regulation.findOne({})
                .then(regulation => {
                    if(!regulation) {
                        regulation = new Regulation();
                        regulation.save()
                    }
                })
        }
        next();
    })
    app.get('/', (req, res) => {
        const user = req.session.user || null;
        res.render('home', { cssFile: 'layout.css', 
                             showHeader: true, 
                             userLogin: user || null,
                             isAdmin: user && user.role === "admin",
                             isManager: user && user.role === "manager" })
    })
    app.use('/customer', customerRouter)
    app.use('/manager', managerRouter)
    app.use('/admin', adminRouter)
    app.use('/flight', flightRouter)
    app.use('/airport', airportRouter)
    app.use('/booking', bookingRouter)
}

module.exports = route