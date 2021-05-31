const langs = require("../lang/langs.js");
const fs = require("fs");

/**
 * Obtiene el código {@link https://es.wikipedia.org/wiki/ISO_639|ISO 639} dependiendo del {@link https://es.wikipedia.org/wiki/ISO_3166|ISO 3166} extraído por IP
 * @param {string} ISO_3166 - Código ISO 3166 del cual extraer el idioma
 * 
 */
const get_lang = (ISO_3166 = 'EO') => {
  for (let lang in langs) {
    if (langs[lang].includes(ISO_3166)) {
      return lang;
    }
  }
}


/**
 * Obtiene el diccionario de lenguajes en base a su codigo {@link https://es.wikipedia.org/wiki/ISO_639|ISO 639}
 * 
 * @param {string} [ISO_639=eo] - ISO 639 del diccionario a obtener
 *
 */
const get_dictionary = async (ISO_639 = 'eo') => {
  try { var dict = fs.readFileSync(__dirname + `/../lang/${ISO_639}.js`, { encoding: 'utf8' }); }
  catch (err) { var dict = fs.readFileSync(__dirname + `/../lang/es-ES.js`, { encoding: 'utf8' }); }

  const lang2 = JSON.parse(dict.replace('const lang = ', '').replace(/[^:]\/\/.*/g, ''));

  return lang2;
}

module.exports = { get_lang, get_dictionary };