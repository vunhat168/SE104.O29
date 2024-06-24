const path = require('path');
const express = require('express');
const { engine } = require ('express-handlebars');
const methodOverride = require('method-override')
const session = require('express-session')
const port = 3000;
const route = require('./routes/index')

const db = require('./config/db')
db.connect()

const app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'my_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // chỉ sử dụng secure cookie trên production
    httpOnly: true,
    maxAge: 5184000000 // thời gian sống của cookie là 60 ngày
  }
}));


app.engine('hbs', engine({
  extname : '.hbs',
  helpers: {
    sum: (a, b) => a + b,
    bookSeat: (flight) => flight.firstSeat + flight.secondSeat - flight.emptyFirstSeat - flight.emptySecondSeat,
    isSelect: (a, b) => a === b,
    isMidAirport: (array, index, name) => array && array[index] && array[index].name === name,
    getStopTime: (flight, index) => (flight && flight.midAirports && flight.midAirports[index] !== undefined) ? flight.midAirports[index].stopTime : "",
    getNote: (flight, index) => (flight && flight.midAirports && flight.midAirports[index] !== undefined) ? flight.midAirports[index].note : "",
    repeat: (n, block) => {
      var accum = '';
      for(var i = 0; i < n; ++i)
          accum += block.fn(i);
      return accum;
    }
  }
}));

app.use(methodOverride('_method'))

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})