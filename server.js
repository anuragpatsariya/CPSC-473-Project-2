"use strict";
/* jshint unused: false */
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var objectId = require("mongodb").ObjectID;
//var mongoose = require("mongoose");
var formidable = require("formidable");
var app = express();
var MongoClient = mongodb.MongoClient;
var session = require("express-session");
app.use(express.static("."));
app.use(express.static(__dirname + "/js"));
app.use(express.static(__dirname + "/images"));
app.use(express.static(__dirname + "/lf-ng-md-file-input"));
app.use(bodyParser.json());
app.use(session({ secret: "sh", cookie: { maxAge: 5 * 60 * 1000 } }));
var sess;
var user;
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});


app.post("/upload", function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + "/uploads";
    //file upload path
    var data_file;
    form.parse(req, function (err, fields, files) {
        //you can get fields here
        console.log(fields);

    });
    form.on("fileBegin", function (name, file) {
        file.path = form.uploadDir + "/" + file.name;
        console.log("File: ", file);
        data_file = file;
        //modify file path
    });
    form.on("end", function () {
        //res.sendStatus(200);
        //conn.close();
        console.log("File uploaded.");
        res.send(data_file.name);
        //when finish all process    
    });
    //res.send(data_file.name);
});


//Function to join an event.
app.post("/joinEvent", function (req, res) {
    var event = req.body;
    console.log("You Joined: ", event);
    var eventID = event._id;
    var joinee = sess.user;
    var eventName = event.eventName;
    var joineeDoc = {};
    joineeDoc.eventID = eventID;
    joineeDoc.joinee = joinee;
    joineeDoc.eventName = eventName;
    console.log("Joinee Data: ", eventID, joinee);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to connect", err);
        } else {
            console.log("Connected for update.");
            collection = db.collection("event_data");
            collection.findAndModify(
                { "_id": new objectId(event._id) },
                [],
                { $inc: { noOfJoinees: 1 } },
                { new: true },
                function (err, record) {
                    console.log(err, record);
                    console.log("Record Updated.", record);
                    //res.send(record);
                }
            );
        }
    });

    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to connect", err);
        } else {
            console.log("Connected to update Joinee.");
            collection = db.collection("joinee_data");
            collection.insert(joineeDoc, { w: 1 }, function (err, record) {
                console.log(err, record);
                console.log("Record Updated.", record);
                res.send(record);
            }
            );
        }
    });
});

//Function to delete an event.
app.post("/deleteEvent", function (req, res) {
    console.log("Server deleteEvent called.");
    console.log(req.body);
    var eventID = req.body._id;
    console.log(eventID);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to connect for delete." + err);
        } else {
            console.log("connected for delete.");
            collection = db.collection("event_data");
            collection.remove({ "_id": new objectId(eventID)}, function (error, record) {
                //    if(!error){
                //        console.log(record);
                res.send(record);
                //    }
            });
        }
    });
});

//Function to logout.
app.post("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            //res.redirect('/');
            res.send("Logged out.");
        }
    });
    //res.send("username set to NULL");

});

//Function for login.
app.post("/login", function (req, res) {
    sess = req.session;
    var username = req.body.username;
    var pwd = req.body.pwd;
    var collection;
    //console.log(username, pwd);
    MongoClient.connect("mongodb://localhost:27017/user_data", function (err, db) {
        if (err) {
            console.log("Unable to connect for login.");
        } else {
            console.log("Connected for login verification.");
            collection = db.collection("user_data");
            collection.find({ "username": username, "password": pwd }).toArray(function (err, result) {
                if (err) {
                    console.log("Db error");
                    res.send(err);
                } else {
                    console.log(result);
                    console.log(result.length);
                    //console.log(result.body.username, result.body.passwprd);
                    if (result.length === 1) {
                        console.log("Login Successful.");
                        sess.user = result[0].username;
                        console.log(sess.user, result[0].username);
                        user = result[0].username;
                        console.log("Welcome " + user + "!!");
                        res.send(user);
                    } else {
                        console.log("Incorrect username or password.");
                        res.send("failure");
                    }

                    //res.send(result);
                }
            });
        }
    });
});

//Function to get events.
app.post("/getEvents", function (req, res) {
    sess = req.session;
    console.log(req.body);
    console.log("Ready to serve Data.");
    console.log(sess);
    var collection;
    if (sess.user) {
        //var loggedinUSer = req.body.username;
        //var collection;
        MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
            if (err) {
                console.log("Unable to get Events.");
            } else {
                console.log("Connected to get Events.");
                collection = db.collection("event_data");
                // collection.find({"addedBy":loggedinUSer}).toArray(function (err, result) {
                collection.find({}).toArray(function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log("user data");
                        //console.log(result);
                        res.send(result);
                    }
                });
            }
        });

    } else {
        MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
            if (err) {
                console.log("Unable to get Events.");
            } else {
                console.log("Connected to get Events.");
                collection = db.collection("event_data");
                collection.find({}).toArray(function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log("all Data");
                        res.send(result);
                    }
                });
            }
        });
    }
});

//Function to register a user.
app.post("/registerUser", function (req, res) {
    var doc = req.body;
    console.log(doc);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/user_data", function (err, db) {
        if (err) {
            console.log("Unable to connect.");
        } else {
            console.log("Connected to insert.");
            collection = db.collection("user_data");
            collection.insert(doc, { w: 1 }, function (err, record) {
                console.log(record);
                res.send(record.ops[0]);
            });
        }
    });
    //res.send("Data Recieved");
});

//Function to create an event.
app.post("/createEvent", function (req, res) {
    var doc = req.body;
    console.log(user);
    //console.log(sess.user);
    doc.addedBy = user;
    doc.noOfJoinees = 0;
    console.log(doc);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to connect.");
        } else {
            console.log("Connected to insert.");
            collection = db.collection("event_data");
            collection.insert(doc, { w: 1 }, function (err, record) {
                console.log(record);
                res.send(record.ops[0]);
            });
        }
    });
    //res.send("Data Recieved");
});

//Forever Alone but important code for server listening on port 5000.
app.listen(5000, function () {
    console.log("Working on port 5000");
});