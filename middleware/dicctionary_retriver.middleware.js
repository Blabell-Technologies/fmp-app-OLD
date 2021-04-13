const lang = require(process.env.dirname + '/lib/lang.lib');
const print = require('../lib/logger.class.lib');
const geoip = require('geoip-lite');

module.exports = async (req, res, next) => {
	// Creamos el objeto de lenguajes
	req.lang = { iso3166: String, iso639: String, dictionary: {} }

	if (req.cookies['lang'] == undefined) {
		// Obtención de la IP v4
		let ip_v4 = req.ip.replace('::ffff:', '');
		if (ip_v4.startsWith('192.168')) { ip_v4 = '190.124.15.175'; print.warn('Private IP detected'); }
	
		// Obtención del ISO 3166 de la IP
    var ISO3166 = geoip.lookup(ip_v4).country;
		req.lang.iso3166 = ISO3166;
	}	
	
	// Obtenemos el ISO 639 referente al ISO 3166
	const ISO639 = req.cookies['lang'] || lang.get_lang(ISO3166);
	req.lang.iso639 = ISO639;
	
	// Obtenemos el diccionario del ISO 639
	const dictionary = await lang.get_dictionary(ISO639);
	req.lang.dictionary = dictionary;

  // Establece la cookie de lenguaje
	res.cookie('lang', ISO639, { expires: new Date(Date.now() + 604800000), secure: true });

  // Traducción en tiempo real
	const translate = (text, obj) => { 
		const result = obj[text];
		return result
	};
	req.lang.translate = translate;

	
	next();
}
