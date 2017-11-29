const email = require("emailjs");
const bcrypt = require("bcrypt");

const server = email.server.connect({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  ssl: true
});

module.exports.sendVerificationEmail = (user) => {
  const registrationEmail = {
    text: `Welcome to the User DB, ${user.name}! ` +
        "Please follow this link to verify your account: " +
        "http://localhost:4000/verify?token=" +
        user.validationKey,
    from: `Mark <test@example.com>`,
    to: `${user.name} <${user.email}>`,
    subject: "Registration with the User DB",
    attachment: [{
      data: "<html>" +
        "Welcome to the User DB, " + user.name + "! " +
        "<a href='http://localhost:4000/verify?token=" +
        user.validationKey + "'>" +
        "Please click here to verify your account.</a>" +
        "</html>", alternative: true
    }]
  };

  server.send(registrationEmail, (err, message) => {
    console.log(err || `Verification email sent to ${user.name}`);
  });
};
