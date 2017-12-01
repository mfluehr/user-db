"use strict";

require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

// Init application
const app = express();

// Database
mongoose.Promise = global.Promise;  // Override deprecated property
mongoose.connect(process.env.DATABASE, {
  useMongoClient: true  // Override deprecated property
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

// Sessions
const MongoStore = require("connect-mongo")(session);

app.use(session({
  secret: process.env.SESSION_SECRET || "kJAh9pp6Z5n07yT",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});

// View templating
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

// Static file directory
app.use(express.static(`${__dirname}/public`));

// Request parser
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlencodedParser);

// Request router
const routes = require("./routes/routes");
app.use("/", routes);

// Errors
app.use((req, res, next) => {
  const err = new Error("File not found.");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message
  });
});

// Request listener
app.listen(process.env.PORT || 4000, () => {
  console.log("App listening for requests");
});
