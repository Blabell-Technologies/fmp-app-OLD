const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'c2160549.ferozo.com',
  port: 465,
  auth: {
    user: process.env['EMAIL.USER'],
    pass: process.env['EMAIL.PASS']
  }
});

module.exports = transport;