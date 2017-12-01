const crypto = require("crypto");
const express = require("express");
const User = require("../models/user");
const mid = require("./middleware");
const emailer = require("../modules/emailer");

const router = express.Router();


router.get("/", (req, res, next) => {
  return res.render("index");
});

router.get("/email-sent", (req, res, next) => {
  return res.render("email-sent");
});

router.get("/login", mid.requiresLogout, (req, res, next) => {
  return res.render("login");
});

router.post("/login", mid.requiresLogout, (req, res, next) => {
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

router.get("/logout", mid.requiresLogin, (req, res, next) => {
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
        return res.render("profile");
      });
});

router.post("/profile", mid.requiresLogin, (req, res, next) => {
  const update = req.body;

  User.findByIdAndUpdate(req.session.userId, update)
      .exec((err, user) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/profile");
      });
});

router.get("/register", mid.requiresLogout, (req, res, next) => {
  return res.render("register");
});

router.post("/register", mid.requiresLogout, (req, res, next) => {
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

    req.body.validationDate = Date.now();
    req.body.validationKey = crypto.randomBytes(20).toString("hex");

    User.create(req.body, (err, user) => {
      if (err) {
        return next(err);
      }

      emailer.sendValidationEmail(user);
      return res.redirect("/email-sent");
    });
  });
});

router.get("/verify", mid.requiresLogout, (req, res, next) => {
  const hoursToMs = (hours) => hours * 60 * 60 * 1000;

  const rejectValidation = (msg = "Your account verification is invalid.") => {
    res.status(400);
    return res.render("verify", {
      error: msg
    });
  };

  if (!req.query.uid || !req.query.token) {
    return rejectValidation();
  }

  User.findById(req.query.uid)
      .exec((err, user) => {
        if (err) {
          return next(err);
        }
        else if (!user) {
          return rejectValidation();
        }

        if (Date.now() - user.validationDate > hoursToMs(48)) {
          return rejectValidation("Your verification code has expired.");
        }
        else if (req.query.token === user.validationKey) {
          const update = {
            validationKey: "VERIFIED",
            $unset: {
              validationDate: ""
            }
          };

          User.findByIdAndUpdate(req.query.uid, update)
              .exec((err, user) => {
                if (err) {
                  return next(err);
                }

                return res.render("verify");
              });
        }
        else {
          return rejectValidation();
        }
  });
});

module.exports = router;
