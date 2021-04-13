/** Importación de tipado */
const TExpress = require('express');
/** Importación del modulo de impresión */
const print = require(process.env.dirname + '/lib/logger.class.lib');


/** Imprime un log en base al estado final de la petición
 * @param {TExpress.Request} req 
 * @param {TExpress.Response} res 
 * @param {TExpress.NextFunction} next 
 */
module.exports = (req, res, next) => {
  // Obtiene el tiempo de inicio de la petición 
	req.time = new Date().getTime();
  // Al finalizar la petición...
	req.on('end', () => { 
    // Imprime la respuesta con los datos recopilados
		if (res.statusCode >= 400) print.response(req.time, req.path, req.method, res.statusCode, req.ip.replace('::ffff:', ''));	
  })
	next();
}