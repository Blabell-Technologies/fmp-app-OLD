const fs = require('fs');

module.exports = (template, options) => {
  try { var file = fs.readFileSync(`${process.env.basedir}/${template}.html`, { encoding: 'utf8' }) }
  catch (err) { throw err }

  for (option in options) {
    const value = options[option];
    const regex = new RegExp(`{{ ${option} }}`, 'gm');
    file = file.replace(regex, value);
  }

  return file;
}