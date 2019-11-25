// Set up
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors'),
    config = require('./config.json');
var request = require('request');
var http = require('http');
var errorhandler = require('errorhandler');
 
// Configuration
// mongoose.connect('mongodb://localhost/softeng');

mongoose.connect(config.database, {
    useMongoClient: true
});

const port = process.env.PORT || 8080;
 
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());
 
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 
// Models
var Papers = mongoose.model('papers', {
    title: String,
    authors: String,
    abstract: String,
    dept: String,
    publish_date: String,
    status: String
}); 
 
var Users = mongoose.model('users', {
    last_name: String,
    first_name: String,
    middle_initial: String,
    stud_no: Number,
    pwd: String,
    prog: String,
    yr_level: Number,
    adviser: String,
    borrowed_papers: [
        {
            title: String,
            authors: String,
            abstract: String,
            dept: String,
            publish_date: String,
            category: String,
            remarks: String
        }
    ]
})
// Routes
 
    // Get papers
    app.get('/papers', function(req, res) {
 
        console.log("fetching papers");
 
        // use mongoose to get all papers in the database
        Papers.find(function(err, papers) {
 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
 
            res.json(papers); // return all papers in JSON format
        });
    });

    app.get('/users', function(req, res) {
 
        console.log("calling users");
 
        // use mongoose to get all papers in the database
        Users.find(function(err, users) {
 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
 
            res.json(users); // return all papers in JSON format
        });
    });

    // allow a user to borrow a paper
    app.post('/users/borrow', function(req, res){
        console.log("Updating "+req.body.userId+"!");

        Users.findByIdAndUpdate(req.body.userId, {
            $push: {"borrowed_papers": {
                title: req.body.title, 
                authors: req.body.authors, 
                abstract: req.body.abstract, 
                dept: req.body.dept, 
                publish_date: req.body.publish_date,
                category: req.body.category
            }}
        }, {
            safe: true,
                new: true
        }, function(err, users){
            if(err){
                res.send(err);
            } else {
                res.json(users);
            }
        });
        console.log("Borrowed paper!");
    });

    // update paper's availability status
    app.post('/papers/statusUpdate', function(req, res){
        console.log("Updating "+req.body._id+"!");

        Papers.findByIdAndUpdate(req.body._id, {
            $set: {status: "unavailable"}
        }, {
            safe: true,
                new: true
        }, function(err, papers){
            if(err){
                res.send(err);
            } else {
                res.json(papers);
            }
        });
        console.log("Status updated!");
    });
 
    // create review and send back all papers after creation
    app.post('/papers', function(req, res) {
 
        console.log("creating review");
 
        // create a review, information comes from request from Ionic
        Papers.create({
            title : req.body.title,
            description : req.body.description,
            rating: req.body.rating,
            done : false
        }, function(err, review) {
            if (err)
                res.send(err);
 
            // get and return all the papers after you create another
            Papers.find(function(err, papers) {
                if (err)
                    res.send(err)
                res.json(papers);
            });
        });
 
    });
 
 
// listen (start app with node server.js) ======================================
// app.listen(8100);
http.createServer(app).listen(port, function(err) {
    console.log("App is listening on port "+port);
});