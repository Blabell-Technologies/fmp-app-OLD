process.env.dirname = __dirname;

//#region Importado de nodemodules

	const express = require('express');
	const path = require('path');
	const fetch = require('node-fetch');
	const cookieParser = require('cookie-parser');
	const autoParser = require('express-query-auto-parse');
	const dotenv = require('dotenv')

//#endregion

//#region Importado de modulos por directorio

	const print = require(__dirname + '/lib/logger.class.lib');

//#endregion

//#region Creación de express y generación de logs

	const app = express();
	dotenv.config();

	// Imprime en consola datos de la respuesta de la consulta
	app.use(require('./middleware/request_logs.middleware'));

//#endregion

//#region Rutas de archivos y documentos para el frontend con sus headers

	const headers = {
		etag: true,
		lastModified: true,
		setHeaders: (res) => {
			res.setHeader('Cache-Control', 'no-store'),
			res.setHeader('X-Content-Type-Options', 'nosniff');
			res.removeHeader('X-Powered-By');
		}
	}

	app.use('/styles', express.static(path.join(__dirname, '/views/css'), headers));
	app.use('/scripts', express.static(path.join(__dirname, '/views/scripts'), headers));
	app.use('/icons', express.static(path.join(__dirname, '/views/assets/icons/'), headers));
	app.use('/img', express.static(path.join(__dirname, '/views/assets/img/'), headers));
	app.use('/lib', express.static(path.join(__dirname, '/lib'), headers));
	app.use('/lang', express.static(path.join(__dirname, '/lang'), headers));
	app.use('/service-worker', express.static(path.join(__dirname, '/sw.js'), headers));

	app.use('/financial', express.static(path.join(__dirname, 'administration', 'financial'), headers));

	app.get("/manifest.webmanifest", (_req, res) => {
		headers.setHeaders(res);
		res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
		res.sendFile(path.join(__dirname, "manifest.webmanifest"));
	});

//#endregion

//#region Confuraciónes de express

	// Configuración del motor de renderizado
	app.set('view engine', 'pug');
	app.set('trust proxy', true);

//#endregion

//#region Parsing de cookies y querys
	
	// Parsing de las cookies
	app.use(cookieParser());

	// Parsing y conversión de los query
	app.use(autoParser());

	// Convierte el body a un objeto JSON
	app.use(express.json());

//#endregion

//#region Middlewares y rutas

	// Configuración de headers
	app.get('/*', (req, res, next) => {
		res.set({
			'Cache-Control': 'no-cache',
			'X-Content-Type-Options': 'nosniff',
		});
		res.removeHeader('X-Powered-By');
		next();
	});

	// Obtención de ISOs y diccionarios de lenguaje
	app.use(require('./middleware/dicctionary_retriver.middleware'));
	
	// Rutas de la api
	app.use('/api', require('./api/router/api.routes'));

	// Rutas de la api
	app.use('/administration', require('./administration/administration.routes'));

	// Prohibe la entrada a todo usuario que acceda desde un dispositivo no soportado
	app.use(require('./middleware/ua_detection.middleware'));

	

//#endregion

//#region Rutas de la app

	// Página principal
	app.get('/', (req, res) => { return res.render('pet_list', { 'search': null, 'lang': req.lang}); });

	// Búsqueda de una mascota
	app.get('/search', (req, res) => { return res.render('pet_list', { 'search': req.query.q, 'lang': req.lang}); });

	// Página de información sobre una mascota 
	app.get('/pet/info/:id', async (req, res, next) => {

		try {
			// Creación de url
			let url = new URL(`http://127.0.0.1:3002/api/pets/exp/post/${req.params.id}`);
				url.searchParams.append('include', 'owner_name');
				url.searchParams.append('include', 'pet_name');
				url.searchParams.append('include', 'pictures');

				const request = await fetch(url);
				const decoded = await request.json();
				if (request.status >= 500) throw new Error(decoded.kind);

				if (decoded.kind == 'validation-error' || decoded.kind == 'resource-error') return next();

			return res.render('pet_info', { 'info': decoded, 'lang': req.lang, 'id': req.params.id });
		} catch(error) {
			return res.render('error', { 'error': error, 'lang': req.lang });
		}
	});

	// Añadido de mascota
	app.get('/pet/add', async (req, res) => { return res.render('pet_add', { 'lang': req.lang }); });

	// Mascota publicada correctamente
	app.get('/pet/add/success/:id', async (req, res) => {
		if (req.query.owner_email != undefined) return res.render('pet_success', { info: req.query, lang: req.lang });
		else return res.render('error', { 'error': 'Datos erroneos', 'lang': req.lang });
	});

	app.get('/pet/add/confirm/:id', (req, res) => {
		if (req.params.id != undefined) return res.render('pet_confirm', { info: req.params.id, lang: req.lang });
		else return res.render('error', { 'error': 'Datos erroneos', 'lang': req.lang });
	})

	// Edición de mascota
	app.get('/pet/edit/:id', async (req, res) => { return res.render('pet_edit', { 'lang': req.lang }); });

	// Mascota encontrada
	app.get('/pet/found', (req, res) => {
		if (req.query.pet_name != undefined) return res.render('pet_found', { 'info': req.query, 'lang': req.lang });
		else return res.render('error', { 'error': 'Hubo un error', 'lang': req.lang });
	});

	// Configuraciónes
	app.get('/settings', (req, res) => { return res.render('settings', { 'lang': req.lang }); });

	// Post de noticia
	app.get('/info/:permalink', (req, res) => { return res.render('info', { 'lang': req.lang }); });

	// Pagina de error generica del SW
	app.get('/error', (req, res) => { return res.render('error', { 'lang': req.lang }); });

	// Error 404
	app.use((req, res) => { return res.status(404).render('error', { 'lang': req.lang }); });

//#endregion

// Despliegue del servidor
app.listen(process.env.PORT, print.info(`Application deployed on port ${process.env.PORT}`));