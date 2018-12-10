let nss = require('node-simple-server');
require('./geojson-schema.js');
require('dotenv').config({path: '.env'});

const mongoose = require('mongoose');
const TestSchema = new mongoose.Schema({
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

const mongoConnectionURL = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;
console.log(mongoConnectionURL);

let ss = new nss.SimpleServer(process.env.SERVER_PORT, './');
ss.addRoute('GET', '/api/1.0/pong', (request, response) => {
    console.log('Pong request!');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    response.setHeader('Access-Control-Allow-Headers', '*');
    response.writeHead(200, {});
    response.end();
});
ss.addRoute('POST', '/point', (request, response) => {
    console.log('Point request!');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    response.setHeader('Access-Control-Allow-Headers', '*');
    let arrival = [];
    request
        .on('data', (chunk) => { arrival.push(chunk); })
        .on('end', () => {
            arrival = Buffer.concat(arrival).toString();
            arrival = JSON.parse(arrival);
            console.log('arrival: ', arrival);

            console.log(mongoConnectionURL);
            mongoose.connect(mongoConnectionURL, {useNewUrlParser: true});
            let db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', () => {
                let GeoJSON = db.model('GeoJSON', TestSchema);
                let newPoint = new GeoJSON({title: 'test', feature: arrival.feature});
                console.log('New Point!');
                newPoint.save((error, document) => {
                    if (error) {
                        console.error(error);
                        db.close();
                        let shipment = {ok: false};
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(shipment));
                        return false;
                    } else {
                        console.log('New document', document);
                        db.close();
                        let shipment = {ok: true, document};
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(shipment));
                        return true;
                    }
                });

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
            });
        });
});
ss.addRoute('POST', '/points', (request, response) => {
    console.log('Point request!');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    response.setHeader('Access-Control-Allow-Headers', '*');
    let arrival = [];
    request
        .on('data', (chunk) => { arrival.push(chunk); })
        .on('end', () => {
            arrival = Buffer.concat(arrival).toString();
            arrival = JSON.parse(arrival);
            console.log('arrival: ', arrival);

            console.log(mongoConnectionURL);
            mongoose.connect(mongoConnectionURL, {useNewUrlParser: true});
            let db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', () => {
                let GeoJSON = db.model('GeoJSON', TestSchema);
                GeoJSON.find({}, (error, documents) => {
                    if (error) {
                        console.error(error);
                        db.close();
                        let shipment = {ok: false};
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(shipment));
                        return false;
                    } else {
                        console.log('Documents found', documents);
                        db.close();
                        let shipment = {ok: true, documents};
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(shipment));
                        return true;
                    }
                });
            });
        });
});
ss.events.on('Server Is Listening', () => {
    console.log('Server started');
});
ss.startServer();
console.log('Server is running');
