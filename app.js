"use strict";

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

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
  secret: "wp2ixh35ih8jp9p254yds",
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

// Templating language
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

// Static file directory
app.use(express.static(`${__dirname}/public`));

console.log(__dirname);

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
