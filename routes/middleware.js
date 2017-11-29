module.exports.requiresLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  const err = new Error("You must be logged in to view this page.");
  err.status = 401;
  return next(err);
};

module.exports.requiresLogout = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }

  return next();
};



////
/*module.exports.mongooseValidations = (err, req, res, next) => {
  if (err.errors) {
    const error = {};
    const keys = Object.keys(err.errors);

    keys.forEach((key) => {
      let message = err.errors[key].message;

      if (err.errors[key].properties && err.errors[key].properties.message) {
          message = err.errors[key].properties.message.replace('`{PATH}`', key);
      }

      message = message.replace('Path ', '').replace(key,'').trim();
      error[key] = message;
    });

    return next(error);
  }

  return next();
};
*/
