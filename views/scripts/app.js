

var page = document.getElementsByTagName('html')[0];
const sw_lang = page.attributes.lang.value;
let app_version;




// - - - - - - - - - - - - - - - - - - - - - - - -
// - FUNCIONES GLOBALES			                 -
// - - - - - - - - - - - - - - - - - - - - - - - -


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


// Crea el elemento de carga
function loading() {

	// Generación del contenedor
	let ctnr = document.createElement('div');
		ctnr.classList.add('loading');

	// Añadido de tres puntos con sus respectivas clases
	for (let i = 0; i < 3; i++) {
		let dot = document.createElement('div');
			dot.classList.add('circleG', `circleG_${i}`);
		ctnr.appendChild(dot);
	}

	// Devolución de la animación generada
	return ctnr;
}


// Se genera una variable con la animacion al cargar el documento
const load_animation = loading();


// Para cada animacion nueva que se necesite, se duplica la previamente existente
const new_load = (big = false) => load_animation.cloneNode(true).classList.add((big == true) ? 'loadfirst' : null);


// Al haber un error con la imágen, modifica el source a una de error
const img_error = e => e.currentTarget.setAttribute('src', window.location.origin + '/img/error.png');


// Genera el boton de Cafecito
function support_us(target) {
	// Sección
	const ctnr = document.createElement('div');
	ctnr.id = 'supportus';
  
	// Título
	const title = document.createElement('h3');
	title.innerHTML = lang.support_us;
  
	// Enlace a CafecitoApp
	const cappl = document.createElement('a');
	cappl.classList.add('capp_link');
	cappl.href = 'https://cafecito.app/foundmypet';
	cappl.rel = 'noopener';
	cappl.target = '_blank'
  
	// Imagen del café
	const cappi = document.createElement('img');
	cappi.src = '/img/cappi.png';
	cappi.alt = lang.gusbone;
	cappl.appendChild(cappi);
  
	// Texto del café
	const cappt = document.createElement('h3');
	cappt.innerHTML = lang.gusbone;
	cappl.appendChild(cappt);
  
  
	ctnr.appendChild(title);
	ctnr.appendChild(cappl);
  
	document.querySelector(target).appendChild(ctnr);
}


// Establece una cookie
function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}


// Obtiene una cookie
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
	  var c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
}



// Convierte parametros del objeto con información de una mascota a un formato legible
function format_api_data(data) {

	// Si existen datos de fecha, se convierten
	if (data.disappearance_date != undefined) {

		const date = {
			year: data.disappearance_date.substring(0, 4),
			month: data.disappearance_date.substring(5, 7),
			day: data.disappearance_date.substring(8, 10),
		}

		const day = date.day + '/' + date.month + '/' + date.year;
		const hour = data.disappearance_date.substring(11, 16);
		data.disappearance_date = day + ' - ' + hour;
	}
	
	if (data.pet_race != undefined && data.pet_animal != undefined) { data.race = data.pet_race; data.pet_race = lang.races[data.pet_animal][data.pet_race]; }
	if (data.pet_animal != undefined) { data.animal = data.pet_animal; data.pet_animal = lang.animals[data.pet_animal]; }

	return data;
}


// Detecta cuando ocultar el footer
function footer_hiding() {

	let footer = document.getElementById('footer');

	const hide_footer = () => footer.classList.add('hide');
	const show_footer = () => footer.classList.remove('hide');

	const scroll = (e) => { if (e.target.activeElement.tagName == 'INPUT') hide_footer(); }

	let inputs = document.getElementsByTagName('input');
	window.addEventListener('scroll', scroll);
	for (let i = 0; i < inputs.length; i++) {
		const elem = inputs[i];
		elem.addEventListener('focus', hide_footer);
		elem.addEventListener('blur', show_footer);
	}
}


// Muestra al usuario que campos son opcionales
function set_optionals() {

	let opt_inputs = document.querySelectorAll('input.optional');
	let opt_selects = document.querySelectorAll('select.optional');

	for (const opt_input of opt_inputs) {
		const span = opt_input.parentNode.querySelector('span');
		span.dataset.opt_text = lang.optional;
	}

	for (const opt_select of opt_selects) {
		const span = opt_select.previousSibling.querySelector('span');
		span.dataset.opt_text = lang.optional;
	}



	let place_inputs = document.querySelectorAll('input.address_input');
	for (const place_input of place_inputs) {
		place_input.placeholder = lang.places_hint;
	}
}




// - - - - - - - - - - - - - - - - - - - - - - - -
// - ACTUALIZACIÓN DE LA APP		             -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Promoción de la actualización de la app
function promote_app_update() {

	// Obtención del cuerpo
	const body = document.getElementsByTagName('body')[0];

	// En caso de que el promotor de la instalación no esté, se añade
	if (document.getElementById('appupdate') == undefined) {

		// Creación del contenedor
		let ctr = document.createElement('div');
			ctr.id = 'appupdate';
		
		// Creación de la cruz
		let x = document.createElement('span');
			x.classList.add('icon-close');
			x.addEventListener('click', (e) => {
				ctr.remove();
			})
		
		// Creación del texto
		let text = document.createElement('p');
			text.innerHTML = lang.app_update;
	
		// Creación del botón
		let btn = document.createElement('button');
			btn.innerHTML = lang.update;
			btn.addEventListener('click', (e) => {

				// Al tocarlo le envía un mensaje al service worker que dispara la actualización
				if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ version: 'update' });
			});
	
		// Añadido de los elementos al contenedor
		ctr.append(x);
		ctr.append(text);
		ctr.append(btn);
	
		// Añadido del contenedor al cuerpo
		body.prepend(ctr);
	}
}


// Actualiza el service worker (android)
async function update_sw() {
	if (navigator.serviceWorker.controller) new_worker.postMessage({action: 'skipWaiting', lang: sw_lang, version: app_version });
}


// Actualiza el service worker (iOS)
async function ios_update_sw() {
	if (navigator.serviceWorker.controller) new_worker.postMessage({lang: sw_lang, version: app_version });
}


// Obtiene la última versión
async function check_version() {

	// Si hay conexión
	if (navigator.onLine) {

		try {

			// Solicita la versión al servidor
			const request = await fetch('/api/version');
			const decoded = await request.json();
		
			// console.log('LASTEST VERSION:', decoded.version);

			return decoded.version;

		} catch(error) { console.log('[CLIENT] Cannot search for updates'); }
	}
}


// Actualiza la aplicación
async function update_app() {

	// Obtiene todos los service workers registrados
	navigator.serviceWorker.getRegistrations().then(async function(regs) {

		// Los elimina
		for(let reg of regs) {
			reg.unregister().then(async () => {
				location.reload();
			}).catch((error) => console.log('[CLIENT] Service worker unregistering failed', error)); }	
		}).catch((error) => console.log('[CLIENT] Service worker unregistering failed', error));
}




// - - - - - - - - - - - - - - - - - - - - - - - -
// - INSTALACIÓN DE LA APP		                 -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Variable que contendrá los eventos de instalación
let custom_prompt;


function ios_promote_app_install() {

	let body = document.getElementsByTagName('body')[0];

	// En caso de que el promotor de la instalación no esté, se añade
	if (document.getElementById('iosappinstall') == undefined) {

		page.classList.add('noscroll');
	
		// Creación del contenedor
		let ctr = document.createElement('div');
			ctr.id = 'iosappinstall';
		
		// Creación de la cruz
		let x = document.createElement('span');
			x.classList.add('icon-close');
			x.addEventListener('click', (e) => {
				setCookie('pwa_app', 'denegated', 7);
				page.classList.remove('noscroll');
				ctr.remove();
			})
		
		// Creación del título
		let title = document.createElement('h1');
			title.innerHTML = lang.ios_app_promotion;

		let textone = document.createElement('p');
			textone.innerHTML = lang.ios_app_promotion_textone;
			
		let texttwo = document.createElement('p');
			texttwo.innerHTML = lang.ios_app_promotion_texttwo;

		// Añadido de los elementos al contenedor
		ctr.append(x);
		ctr.append(title);
		ctr.append(textone);
		ctr.append(texttwo);
	
		// Añadido del contenedor al cuerpo
		body.prepend(ctr);
	}
}


// Promoción de la instalacion de la app
function promote_app_install() {

	let body = document.getElementsByTagName('body')[0];

	// En caso de que el promotor de la instalación no esté, se añade
	if (document.getElementById('appinstall') == undefined) {

		// Creación del contenedor
		let ctr = document.createElement('div');
			ctr.id = 'appinstall';
		
		// Creación de la cruz
		let x = document.createElement('span');
			x.classList.add('icon-close');
			x.addEventListener('click', (e) => {
				setCookie('pwa_app', 'denegated', 7);
				ctr.remove();
			})
		
		// Creación del texto
		let text = document.createElement('p');
			text.innerHTML = lang.app_promotion;
	
		// Creación del botón
		let btn = document.createElement('button');
			btn.innerHTML = lang.install;
			btn.addEventListener('click', (e) => install_app());
	
		// Añadido de los elementos al contenedor
		ctr.append(x);
		ctr.append(text);
		ctr.append(btn);
	
		// Añadido del contenedor al cuerpo
		body.prepend(ctr);
	}
}


// Detecta cuando la aplicación es instalable
window.addEventListener('beforeinstallprompt', (e) => {

	// Lo notifica en consola
	// console.log('[INFO] App install available');

	// Evita la reacción predefinida del navegador
	e.preventDefault();

	// Iguala el evento de instalacion a una variable personalizada
	custom_prompt = e;

	// Obtiene la cookie que determina si el usuario antes negó la instalación
	const pwa_app = getCookie('pwa_app');

	// En caso de que no la haya negado, muestra el cuadro proponiendola
	if (pwa_app == undefined || pwa_app == null || pwa_app == '') promote_app_install();
});


// Instala la aplicación
async function install_app(e) {

	custom_prompt = custom_prompt || e;

	// Muestra el cuadro de instalación
	custom_prompt.prompt();

	// Obtiene la respuesta
	const { outcome } = await custom_prompt.userChoice;

	// La notifica en consola
	// console.log('[INFO] User response to app install:', outcome);

	// En caso de que sea positiva
	if(outcome == 'accepted') {

		// Elimina el cuadro proponiendola
		document.getElementById('appinstall').remove();

		// Genera una cookie aclarando que está instalada
		setCookie('pwa_app', 'installed', 7);

		// Elimina los rastros
		custom_prompt = null;
	}
}


// Al cargar la página hace las comprobaciones necesarias para promover la instalación en iOS
window.addEventListener('load', async () => {

	// Comprueba que sea un dispositivo iOS
	const is_iOS = () => {
		return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		].includes(navigator.platform)
		|| (navigator.userAgent.includes("Mac") && "ontouchend" in document);
	}

	// Comprueba que la app no esté instalada en dicho dispositivo
	const is_standalone = () => ('standalone' in window.navigator) && (window.navigator.standalone);

	// Comprueba que la instalación no haya sido negada previamente
	const should_promote = () => {
		const pwa_app = getCookie('pwa_app');
		return (pwa_app != 'denegated') && (pwa_app != 'installed');
	}

	// En caso de que sea pida de iOS y la app no esté instalada, la ofrece
	if (is_iOS() && !is_standalone() && should_promote()) ios_promote_app_install();

	// Oculta el footer cuando algún input esté activo
	footer_hiding();
});



// - - - - - - - - - - - - - - - - - - - - - - - -
// - PERMISOS DE LA APP			                 -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Solicita permisos para mostrar notificaciones
const sw_notification_permission = async (reg) => {

	// Hace la petición
    const permission = await window.Notification.requestPermission();

	// console.log('[CLIENT][PERMISION STATUS]: ' + permission);

	// Imprime en consola información sobre la decisión del cliente
  // if(permission !== 'granted') console.log('[CLIENT] Permission not granted for Notification');
	// else { await push_subscribe(reg); console.log('[CLIENT] Permission granted for Notification'); };
	if (permission === 'granted' && navigator.serviceWorker.controller) await push_subscribe(reg);
}




// - - - - - - - - - - - - - - - - - - - - - - - -
// - SERVICE WORKER				                 -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Almacena los eventos del nuevo service worker si hay una actualización
let new_worker;


// Push Notifications
const PUBLIC_VAPID_KEY = 'BOSzT7DyMkEwzE27m1lGmGeg7nWYdFE552Y9UxqAyGT2JiJOgTTuGTFIrOHzvCGlaKBZaJmD4RNjtPQ6BbryUSY';


// Registro del Serivce Worker
function sw_register() {

	// Registro
	navigator.serviceWorker.register('/service-worker')

	// Al instante de registrar el service worker
	.then(async reg => {

		// console.log('SERVICE WORKER INSTALLED');

		// Si el usuario todavía no aceptó las notificaciones, pregunta y se suscribe a los push
		if (Notification.permission == 'default') sw_notification_permission(reg);

		// Caso contrario, solo se suscribe a los push
		else if (navigator.serviceWorker.controller) sw_notification_permission(reg);

		// Escucha actualizaciones
		// reg.addEventListener('updatefound', () => {

		// 	// Asigna el evento a una variable global
		// 	new_worker = reg.installing;

		// 	// Escucha cuando se modifica el estado
		// 	new_worker.addEventListener('statechange', () => {

		// 		// Evalúa entre estados posibles
		// 		switch (new_worker.state) {

		// 			// Si está instalado notifica que hay una nueva actualización
		// 			case 'installed':
		// 				if (navigator.serviceWorker.controller) {
		// 					// console.log('[SW] New version available');
		// 					promote_app_update();
		// 				}
		// 				break;
		// 		}
		// 	})
		// })
	})
	.catch(err => console.error('[SW] Registering failed', err));

	// Detector de cambio de controlador
	navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());

	// Medio para recibir mensajes
	navigator.serviceWorker.addEventListener('message', e => {
		// console.log('[CLIENT] Message:', e);
		if (e.data.msg != undefined) {
			switch (e.data.msg) {
				case 'reload': location.reload(); break;
				case 'update': promote_app_update(); break;
				case 'updatenow': update_app(); break;
			}
		}
	});

	// Se envía al service worker el lenguaje actual
	navigator.serviceWorker.ready.then(async (reg) => {
		app_version = await check_version();
		reg.active.postMessage({ lang: sw_lang, version: app_version });
	});
}


// Comprueba que el service worker esté disponble y ejecuta las acciones para instalarlo
if ('serviceWorker' in navigator) {
	sw_register();
	} else {
	console.log('[CLIENT] Service worker not supported');
}


// Borra el caché
const ccache = () => {
	caches.keys()
	.catch((e) => {
		console.error(e);
	})
	.then((results) => {
		for (const cdel of results) {
			caches.delete(cdel)
			.then((result) => {
				if ( !result ) throw 'Unknown error';
				// console.log(`[CLIENT] Cache ${cdel} deleted successfuly`);
			})
			.catch((e) => {
				console.error(e);
			});
		}
	})
}


// Se suscribe al servicio de notificaciones push
const push_subscribe = async (reg) => {
	if (navigator.onLine) {
		const subscription = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
		});
	
		await fetch('/api/notifications/subscription', { 
			method: 'POST',
			body: JSON.stringify(subscription),
			headers: { "Content-Type": "application/json" }
		}).catch(e => {/* console.log(e) */});
	}
}




// - - - - - - - - - - - - - - - - - - - - - - - -
// - CAPTCHAS                                    -
// - - - - - - - - - - - - - - - - - - - - - - - -

let captcha_success = false;

async function on_captcha_success(res) {

	try {
		let url = new URL(window.location.origin + '/api/captcha/verify');
				url.searchParams.append('hcaptcha_response', res);
	
		let request = await fetch(url);
				request = await request.json();

		if (!request.success) throw new Error();

		captcha_success = true;
		return request;

	} catch (error) {
		console.error(error);
	}
}