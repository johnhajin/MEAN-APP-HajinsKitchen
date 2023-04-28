const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Connecting the database
mongoose.connect('mongodb://127.0.0.1:27017/hajinskitchendb')
    .then(() => console.log("Database Connection Success"))
    .catch((error) => console.log(error));

//Exports
module.exports = mongoose;
