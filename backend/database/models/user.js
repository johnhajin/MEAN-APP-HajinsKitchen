const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  newFileName: {
    type: String,
    required: true
  },
  
});

const User = mongoose.model('userData', UserSchema);

module.exports = User;
