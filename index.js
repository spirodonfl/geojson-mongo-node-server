let SimpleServer = require('node-simple-server');
require('./geojson-schema.js');
require('dotenv').config({path: '.env'});

let mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME, {useNewUrlParser: true});

let nss = new SimpleServer(process.env.SERVER_PORT, './');
nss.addRoute('POST', '/point', (request, response) => {
    let arrival = [];
    request
        .on('data', (chunk) => { arrival.push(chunk); })
        .on('end', () => {
            arrival = Buffer.concat(arrival).toString();
            arrival = JSON.parse(arrival);
            console.log('arrival: ', arrival);

            let db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', function() {
                var TestSchema = new mongoose.Schema({
                    title: String,
                    test: {},
                    point: mongoose.Schema.Types.Point,
                    multipoint: mongoose.Schema.Types.MultiPoint,
                    linestring: mongoose.Schema.Types.LineString,
                    multilinestring: mongoose.Schema.Types.MultiLineString,
                    polygon: mongoose.Schema.Types.Polygon,
                    multipolygon: mongoose.Schema.Types.MultiPolygon,
                    geometry: mongoose.Schema.Types.Geometry,
                    geometrycollection: mongoose.Schema.Types.GeometryCollection,
                    feature: mongoose.Schema.Types.Feature,
                    featurecollection: mongoose.Schema.Types.FeatureCollection
                }, { typeKey: '$type', collection: 'echoes' });
                var GeoJSON = db.model('GeoJSON', TestSchema);
                let newPoint = new GeoJSON(arrival.feature);

                // var kittySchema = new mongoose.Schema({
                //     name: String
                // });
                // kittySchema.methods.aFunction = function () {
                //     console.log(this.name);
                // }
                // var Kitten = mongoose.model('Kitten', kittySchema);
                // var silence = new Kitten({ name: 'Silence' });
                // console.log(silence.name);
                // silence.save(function (err, silence) {
                //     if (err) return console.error(err);
                //     silence.aFunction();
                // });
                // Kitten.find(function (err, kittens) {
                //     if (err) return console.error(err);
                //     console.log(kittens);
                // });
                // Kitten.find({ name: /^fluff/ }, callback);

                let shipment = {ok: true};
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(shipment));
            });
        });
});
nss.startServer();
console.log('Server is running');
