'use strict'

const webpush = require('web-push');
const print = require('../../lib/logger.class.lib');

try {
  webpush.setVapidDetails('mailto:info@foundmypet.org', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
  print.info('Web push started sucessfuly');
} catch (e) {
  print.error(e);
}

module.exports = webpush;