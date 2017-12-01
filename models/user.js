const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Custom validations
const validations = {
  isEmail: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  isDecimal: /^-*[0-9,\.]+$/
}

// Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [validations.isEmail, "Please enter a valid email address."]
  },
  age: {
    type: Number,
    min: [13, "Your age must be at least 13."]
  },
  location: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: [7, "Your password must be at least 7 characters."],
    maxlength: [30, "Your password can't be more than 30 characters."]
  },
  validationDate: {
    type: Number
  },
  validationKey: {
    type: String
  }
}, {
  timestamps: true
});

// Authenticate input against database documents
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
      .exec((err, user) => {
        if (err) {
          return callback(err);
        }
        else if (!user) {
          const err = new Error("User not found.");
          err.status = 401;
          return callback(err);
        }

        if (user.validationDate) {
          const err = new Error("User not verified.");
          err.status = 401;
          return callback(err);
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (result === true) {
            return callback(null, user);
          }
          else {
            return callback();
          }
        });
      });
}

// Run validators on record update
UserSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  return next();
});

// Hash password before saving to database
UserSchema.pre("save", function (next) {
  const user = this;

  // TODO: add a salt
  /*Salting is the process of randomly generating a long(ish) string,
  and appending or prepending it to the password before you hash it.
  This so called salt can be saved in plain text alongside your password.
  The salt can be saved in plaintext in the database.*/
  // crypto.randomBytes() ??

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }

    user.password = hash;
    return next();
  })
});

const User = mongoose.model("User", UserSchema);



////
//console.log(User.schema.tree);
/*
User.schema.tree.email.match[0]  // Regex
                      .match[1]  // Validation hint
                      .required
                      .unique
*/





module.exports = User;
