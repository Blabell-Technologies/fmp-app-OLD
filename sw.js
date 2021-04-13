// VERSIÓN LA APLICACIÓN
let app_version = '';

// Último fallo registrado
let last_fail;


// Variable del lenguaje
let sw_lang = '';

// Archivos básicos
const resources = [
	'/img/error.png',
	'/img/logos/fmp_logo-192.png',
	'/img/logos/fmp_logo-512.png',
	'/manifest.webmanifest',
	'/'
];

// Archivos de error para cuando no haya conexión
const offline = [
	'/error',
	'/scripts/error.js',
	'/scripts/app.js',
	'/scripts/integrity.js',
	'/lib/dist/alerts.class.js',
	'/lib/toast.js',
	'/lib/modal.js',
	'/styles/basics.css',
	'/styles/reset.css',
	'/icons/icons.css',
	'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
];


// Añade todos los recursos básicos al caché
async function add_basic_resources() {
	return caches.open('offline').then(function(offline_cache) {
		return offline_cache.addAll(offline);
	}).then(function() {
		caches.open('assets').then(function(assets_cache) {
			return assets_cache.addAll(resources);
		})
	});
}



// Limpia los caches
const clear_cache = () => {
	caches.keys()
	.catch((e) => {
		console.error(e);
	})
	.then((results) => {
		// console.log('Deleting cache,', results);
		for (const cdel of results) {
			caches.delete(cdel)
			.then((result) => {
				if ( !result ) throw 'Unknown error';
				// console.log(`[SW] Cache ${cdel} deleted successfuly`);
			})
			.catch((e) => {
				console.error(e);
			});
		}
	})
	.then(() => add_basic_resources())
}



// Etapa de instalación
self.addEventListener('install', e => {

	// Notifica que se instaló correctamente
	// console.log('[SW] Installed successfully');

});


// Etapa de activación
self.addEventListener('activate', e => {

	// Guarda en el caché los recursos básicos
	e.waitUntil(add_basic_resources());

	// Notifica que se activó correctamente
	// console.log('[SW] Activated successfully');

})


// Intercepta peticiones
self.addEventListener('fetch', async (e) => {

	// console.log(e);
	// Muestra en consola información sobre la petición
	// console.log('[FETCH]', e.request.method, '- Requesting', e.request.destination == '' ? 'info' : e.request.destination, 'from', e.request.url);
	// console.log(e);

	let group;

	switch(e.request.destination) {
		case 'document': group = sw_lang; break;
		case '': group = 'info'; break;
		case 'image': case 'font': group = 'assets'; break;
		default: group = e.request.destination; break;
	}

	let url = new URL(e.request.url);

	// Solo si no es de tipo información...
	if (group != 'info') {

		// Responde con un método propio
		e.respondWith(

			// Abre la carpeta del grupo correspondiente
			caches.open(group).then(async function(group_cache) {
				
				// Y busca el archivo solicitado ahí
				return group_cache.match(e.request).then(async function (group_res) {
	
					// En caso de encontrar el documento lo devuelve y sino abre assets
					return group_res || caches.open('assets').then(async function(assets_cache) {
						
						// Busca el archivo solicitado ahí
						return assets_cache.match(e.request).then(function (assets_res) {

							// En caso de encontrar el documento lo devuelve y sino lo pide
							return assets_res || fetch(e.request).then(async function(fetch_res) {

								if(fetch_res.status > 500 && e.request.destination == 'document') throw fetch_res.status;

								// Al pedirlo y obtenerlo correctamente, lo guarda en resources si es necesario
								if ((fetch_res.type != 'opaque' || fetch_res.url.includes('googleapis')) && (url.pathname.split('/')[2] !== 'info'|| url.pathname.split('/')[1] !== 'administration')) group_cache.put(e.request, fetch_res.clone());

								// Devuelve el documento en cuestión
								return fetch_res;

							// En caso de fallar con la petición, obtiene recursos de la carpeta offline
							}).catch(async function(status) {

								last_fail = status;

								// Abre la carpeta offline
								return caches.open('offline').then(async function(offline) {

									// Obtiene la página de error si se necesita un documento
									if (e.request.destination == 'document') return offline.match('/error').then(function(eac) { return eac; });

									// Caso contrario obtiene un recurso
									return offline.match(e.request).then(function(offline_cache) { return offline_cache });

								})
							});
						});
					});
				});
			})
		);
	}
});


// Al recibir un mensaje...
self.addEventListener('message', async (e) => {

	// Lo muestra en consola
	// console.log('[SW] RECEIVING MESSAGE', e.data);

	// En caso de que sea información sobre el lenguaje lo establece como principal
	if (e.data.lang != undefined) {
		sw_lang = e.data.lang;
		caches.open(sw_lang).then(async function(cache) {
			return cache.addAll(resources).then(/* console.log('[SW] Added root to cache') */);
		})
	}

	// En caso de solicitud de skipWaiting, lo hace
	if (e.data.action === 'skipWaiting') {
		
		// Elimina el caché actual
		clear_cache();

		// Salta la espera activando el service worker nuevamente
		self.skipWaiting();
	}

	// En caso de solicitud de recarga de toda la app
	if (e.data.msg === 'reload') {
		
		// Elimina el caché actual
		clear_cache();

		// Le dice al cliente que está listo para recargar
		e.source.postMessage({ msg: 'reload' });
	}

	// En caso de que haya datos de versión...
	if (e.data.version != undefined) {

		// Si no está definida en el service worker porque es la primera instalación...
		if (app_version == '') {
			
			clear_cache();

			// console.log('ADD SERVICE WORKER VERSION:', e.data.version);

			// La define
			app_version = e.data.version;

		// Si había una version reconocida previamente...
		} else {
			// console.log('ACTUAL VERSION:', app_version);

			// Comprueba si la nueva versión es igual a la actual
			switch(e.data.version) {

				// En caso de que sean iguales no hace nada
				case app_version:
					// console.log('VERSIONS ARE EQUAL');
					break;

				case 'update':
					clear_cache();
					app_version = '';
					e.source.postMessage({ msg: 'updatenow' });
					break;

				case 'check':
					e.source.postMessage({ msg: app_version });
					break;

				// En caso de que sean diferentes elimina el caché y solicita la actualización de la app
				default:
					// console.log('VERSIONS ARE DIFFERENT');
					e.source.postMessage({ msg: 'update' });
					break;
			}
		}
	}

	if (e.data.fail) e.source.postMessage({ code: last_fail });
});


// Escucha las notificaciónes
self.addEventListener('push', e => {
	const data = e.data.json();

	self.registration.showNotification(data.title, { 
		body: data.message,
		icon: '/img/fmpl_192.png'
	})
})