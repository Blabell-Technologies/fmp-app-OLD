// VERSIÓN LA APLICACIÓN
let app_version = '1.0.51';

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
const clear_cache = async (notify = false) => {
	caches.keys()
	.then((results) => {
		for (const cdel of results) {
			caches.delete(cdel)
			.then((result) => { if ( !result ) throw 'Unknown error'; })
			.catch((e) => {
				console.error(e);
			});
		}
	})
	.then(() => { if (notify) post_message({ cache_clear: 'done' }); })
	.catch((e) => { post_message({ cache_clear: 'error' }); console.error(e); });
}


async function post_message(msg) {
	const all_clients = await clients.matchAll();
	for (const client of all_clients) client.postMessage(msg);
}



// Etapa de instalación
self.addEventListener('install', e => {
	e.waitUntil(console.log('[SW] Installing new worker, waiting for activation...'));
});


// Etapa de activación
self.addEventListener('activate', e => {
	
	async function set_new_resources() {
		console.log('[SW] Activating new worker...');
		await clear_cache();
		await add_basic_resources();
		console.log('[SW] New worker ready!');
		console.log('[SW] Reloading to apply changes...');
		post_message({ msg: 'reload' });
	}
	
	e.waitUntil(set_new_resources(e));

});


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

								const req_type = () => fetch_res.type != 'opaque' || fetch_res.url.includes('googleapis');
								const req_path = () => {
									const path = url.pathname.split('/');
									return path[2] !== 'info' && path[2] !== 'edit' && path[1] !== 'administration' && path[3] !== 'success' && path[3] !== 'confirm';
								}
								
								// Al pedirlo y obtenerlo correctamente, lo guarda en resources si es necesario
								if (req_type() && req_path()) group_cache.put(e.request, fetch_res.clone());

								// Devuelve el documento en cuestión
								return fetch_res;

							// En caso de fallar con la petición, obtiene recursos de la carpeta offline
							}).catch(async function(status) {

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
	
	if (e.data.new_worker) self.skipWaiting();
	if (e.data.version != undefined) e.source.postMessage({ msg: app_version });
	if (e.data.cache_clear) {
		await clear_cache(true);
		await add_basic_resources();
	}
	if (e.data.clear_cache) {
		console.log('SW clearing cache');
		await clear_cache();
	}
});


// Escucha las notificaciónes
self.addEventListener('push', e => {
	const data = e.data.json();

	self.registration.showNotification(data.title, { 
		body: data.message,
		icon: '/img/fmpl_192.png'
	})
})