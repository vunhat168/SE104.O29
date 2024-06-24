const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/education');
const Schema = mongoose.Schema;

const User = new Schema({
  name: { type: String, require: true},
  email: { type: String, require: true},
  password: { type: String, require: true},
  role: { type: String }
});

module.exports = mongoose.model('User', User)
  