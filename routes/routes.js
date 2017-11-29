const express = require("express");
const User = require("../models/user");
const mid = require("./middleware");
const emailer = require("../modules/emailer");

const router = express.Router();

router.get("/", (req, res, next) => {
  return res.render("index");
});

router.get("/login", mid.requiresLogout, (req, res, next) => {
  return res.render("login");
});

router.post("/login", (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.render("login", {
      error: "Both your email and password are required."
    });
  }

  User.authenticate(req.body.email, req.body.password, (err, user) => {
    if (err || !user) {
      res.status(401);
      return res.render("login", {
        error: "Wrong email or password."
      });
    }

    req.session.userId = user._id;
    return res.redirect("/profile");
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      return res.redirect("/");
    });
  }
});

router.get("/profile", mid.requiresLogin, (req, res, next) => {
  User.findById(req.session.userId)
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        res.locals.user = user;
        ////res.locals.valdations = validations;
        return res.render("profile");
      });
});

router.post("/profile", mid.requiresLogin, (req, res, next) => {
  User.findByIdAndUpdate(req.session.userId, req.body)
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/profile");
      });
});

router.get("/register", (req, res, next) => {
  return res.render("register");
});

router.post("/register", (req, res, next) => {
  if (!req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.confirmPassword) {
    res.status(400);
    return res.render("register", {
      error: "All fields are required."
    });
  }
  else if (req.body.password !== req.body.confirmPassword) {
    res.status(400);
    return res.render("register", {
      error: "Passwords do not match."
    });
  }

  User.count({ email: req.body.email }, (err, count) => {
    if (err) {
      return next(err);
    }

    if (count !== 0) {
      res.status(400);
      return res.render("register", {
        error: "The specified user already exists."
      });
    }

    req.body.validationKey = "n7y0fdsfwa3wr";

    User.create(req.body, (err, user) => {
      if (err) {
        return next(err);
      }

      emailer.sendVerificationEmail(user);
      req.session.userId = user._id;
      return res.redirect("/profile");
    });
  });
});

router.get("/verify", (req, res, next) => {
  console.log(req.query.token);
  return next();
});

module.exports = router;
