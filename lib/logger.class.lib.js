const dayjs = require('dayjs');
const path = require('path');
const fs = require('fs');
require('colors');

class Print {
  info (...msg) { console.log(`[${new Date().toUTCString()}]`.magenta, ...msg) }
  response(ms, url, method, http_code, ip) { 
    ip = ip.replace('::ffff:', '');
    ip = (ip == '::1') ? 'localhost' : ip;

    ms = new Date().getTime() - ms;

    console.log(`[${new Date().toUTCString()} • ${ms}ms]`.magenta + ` ${url} • ${method} • ${http_code} • ${ip}`)
  }
  error (...msg) {
    console.error(`[${new Date().toUTCString()}]`.red, ...msg);
    this.log(`[${new Date().toUTCString()}]`, ...msg)
  }
  warn (...msg) { console.warn(`[${new Date().toUTCString()}]`.yellow, ...msg) }
  log (prefix, ...msg) {
    if (arguments.length < 2) throw TypeError('This method must have +2 params');

    const filename = dayjs().format('YYYY-MM-DD.log');
    prefix = `\n${prefix}`;
    prefix += `\n\t${msg.join(' ')}\n`;
    fs.appendFileSync(path.join(process.env.dirname, 'logs', filename), prefix);
  }
}

module.exports = new Print();