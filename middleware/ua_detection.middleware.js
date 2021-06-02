const print = require('../lib/logger.class.lib')

module.exports = (req, res, next) => {

	// Listado de OS con sus descripciones segun user-agent
	const os_list = {
		'Windows 3.11': ['Win16'],
		'Windows 95': ['Windows 95', 'Win95', 'Windows_95'],
		'Windows 98': ['Windows 98', 'Win98'],
		'Windows 2000': ['Windows NT 5.0', 'Windows 2000'],
		'Windows XP': ['Windows NT 5.1', 'Windows XP'],
		'Windows Server 2003': ['Windows NT 5.2'],
		'Windows Vista': ['Windows NT 6.0'],
		'Windows 7': ['Windows NT 6.1'],
		'Windows 8': ['Windows NT 6.2', 'WOW64'],
		'Windows 8.1': ['Windows 8.1', 'Windows NT 6.3'],
		'Windows 10': ['Windows 10.0', 'Windows NT 10.0'],
		'Windows NT 4.0': ['Windows NT 4.0', 'WinNT4.0', 'WinNT', 'Windows NT'],
		'Windows CE': ['Windows CE'],
		'Windows ME': ['Windows ME'],
		'Chrome OS': ['CrOS'],
		'Open BSD': ['OpenBSD'],
		'Sun OS': ['SunOS'],
		'Linux': ['Linux', 'X11'],
		'Mac OS': ['Mac_PowerPC', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac OS', 'Mac OS X'],
		'iOS': ['iPhone', 'iPad', 'iPod'],
		'QNX': ['QNX'],
		'BeOS': ['BeOS'],
		'OS/2': ['OS/2'],
		'UNIX': ['UNIX']
	}

	const bot_regex = /WhatsApp|Twitterbot|Face|Telegram/gi;

	// Obtención de la información del OS
	let ua = req.headers['user-agent'];
	if (bot_regex.test(ua)) return next();
	if (ua == undefined) ua = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Mobile Safari/537.36 Edg/89.0.774.50";
	
	let os = ua.match(/\(([^)]+)\)/)[1];

	os = os.split(';');

	// Obtención del OS del usuario
	let user_os = 'not-detected';
	for (system in os_list) {
		for (let i = 0; i < os_list[system].length; i++) {
			if (os_list[system][i] == os[0]) {
				user_os = system;
			}
		}
	}

	// Obtención del dispositivo del usuario
	let user_device = 'not-detected';
	switch (user_os) {
		case 'Linux':
			if (os[1].indexOf('Android') != -1) {
				user_device = 'Mobile';
				user_os = 'Android';
			} else {
				user_device = 'PC';
			};
			break;
		case 'iOS':
			user_device = os[0];
			break;
		case 'Mac OS':
			user_device = 'Mac';
			break;
		default:
			user_device = 'PC';
			break;
	}
	
	if (user_device == 'Mac' || user_device == 'not-detected' || user_device == 'iPad' || user_device == 'PC') {
		print.warn('Not supported device has been blocked');
		return res.render('dns', { 'lang': req.lang });
	}
	
	req.user = { device: user_device, os: user_os };

	next();
}
