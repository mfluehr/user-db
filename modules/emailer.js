const email = require("emailjs");
const bcrypt = require("bcrypt");

const server = email.server.connect({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  ssl: true
});


module.exports.sendValidationEmail = ({
  _id,
  name,
  email,
  validationKey
}) => {
  const validationUrl = `${process.env.URL}verify?ui=${_id}&token=${validationKey}`;

  const registrationEmail = {
    text: `Welcome to the User DB, ${name}! ` +
        `Please use this link to verify your account: ${validationUrl}`,
    ////from: `Mark <test@example.com>`,
    to: `${name} <${email}>`,
    subject: "Registration with the User DB",
    attachment: [{
      data: "<html>" +
        `Welcome to the User DB, ${name}! ` +
        `<a href='${validationUrl}'>` +
        "Please click here to verify your account.</a>" +
        "</html>", alternative: true
    }]
  };

  console.log(registrationEmail.text);

  // server.send(registrationEmail, (err, message) => {
  //   console.log(err || `Verification email sent to ${name}`);
  // });
};
