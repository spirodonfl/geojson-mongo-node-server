require('dotenv').config({path: '.env'});

let mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var kittySchema = new mongoose.Schema({
        name: String
    });
    kittySchema.methods.aFunction = function () {
        console.log(this.name);
    }
    var Kitten = mongoose.model('Kitten', kittySchema);
    var silence = new Kitten({ name: 'Silence' });
    console.log(silence.name); // 'Silence'
    // silence.save(function (err, silence) {
    //     if (err) return console.error(err);
    //     silence.aFunction();
    // });
    Kitten.find(function (err, kittens) {
        if (err) return console.error(err);
        console.log(kittens);
    });
    // Kitten.find({ name: /^fluff/ }, callback);
});

console.log('Done!');
