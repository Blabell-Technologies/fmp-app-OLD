

var page = document.getElementsByTagName('html')[0];
const sw_lang = page.attributes.lang.value;
let app_version;



// - - - - - - - - - - - - - - - - - - - - - - - -
// - FUNCIONES GLOBALES			                 		 -
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
  
	target = typeof(target) == 'string' ? document.querySelector(target) : target;
	target.appendChild(ctnr);
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
		const span = opt_select.previousSibling;
		span.dataset.opt_text = lang.optional;
	}



	let place_inputs = document.querySelectorAll('input.address_input');
	for (const place_input of place_inputs) {
		place_input.placeholder = lang.places_hint;
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



class App {

	constructor() {
		this.body = document.getElementsByTagName('body')[0];
		this.new_worker;
		this.custom_prompt;
		this.worker;
		this.push_subscription;
		this.PUBLIC_VAPID_KEY = 'BOSzT7DyMkEwzE27m1lGmGeg7nWYdFE552Y9UxqAyGT2JiJOgTTuGTFIrOHzvCGlaKBZaJmD4RNjtPQ6BbryUSY';
		this.app_version = '';
	}

	// Inicia la app
	start() {

		// Determina si la aplicación es instalable e inicia el proceso
		const on_installable = () => {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				this.custom_prompt = e;
				const pwa_app = getCookie('pwa_app');
				if (pwa_app == '') {
					if (this.is_ios) this.ios_promote_app_install();
					else this.promote_app_install();
				}
			});
		}

		if ('serviceWorker' in navigator) this.register_service_worker();
		else console.log('[CLIENT] Service worker not supported');

		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({version: 'check'});
		}

		on_installable();
		this.handle_update();
	}

	// Obtiene actualizaciones si las hay
	async handle_update() {
		this.new_worker = await navigator.serviceWorker.getRegistration();
		if (this.new_worker.waiting) {
			this.promote_app_update();
		}
	}

	// Le da al usuario la opción de instalar la app
	promote_app_install() {
		if (document.getElementById('appinstall') == undefined) {
			this.create_header({
				id: 'appinstall',
				text: lang.app_promotion,
				button: lang.install,
				on_close: function() {
					setCookie('pwa_app', 'denegated', 7);
				},
				on_accept: () => {
					this.install();
				}
			})
		}
	}

	// Da opción a actualizar la app
	promote_app_update() {
		if (document.getElementById('appupdate') == undefined) {
			this.create_header({
				id: 'appupdate',
				text: lang.app_update,
				button: lang.update,
				on_accept: () => {
					this.update(this.new_worker);
				}
			})
		}
	}

	// Registra y maneja el service worker
	async register_service_worker() {

		// Solicita la aceptación de notificaciones
		const push_permission = (reg) => {
			if (Notification.permission == 'default' || navigator.serviceWorker.controller) this.sw_notification_permission(reg);
		}

		// Callback al recibir un mensaje desde el service worker
		const on_message = (e) => {
			// console.log('[CLIENT] Message:', e);
			if (e.data.cache_clear != undefined) {
				let event = new CustomEvent('clearcache', { detail: e.data.cache_clear });
				this.body.dispatchEvent(event);
			}

			if (e.data.msg != undefined) {
				switch (e.data.msg) {
					case 'reload': location.reload(); break;
					default: this.app_version = e.data.msg; break;
				}
			}
		}
		

		this.worker = navigator.serviceWorker.register('/service-worker')
		.then(async (e) => { push_permission(e); return e; })
		.catch(err => console.error('[SW] Registering failed', err));

		navigator.serviceWorker.addEventListener('message', (e) => on_message(e));
		navigator.serviceWorker.ready.then(async (reg) => reg.active.postMessage({ lang: sw_lang }));
	}

	// Genera headers
	create_header({id, text, button, on_close, on_accept}) {

		let ctnr = document.createElement('div');
				ctnr.id = id;
		
		let x = document.createElement('span');
				x.classList.add('icon-close');
				x.addEventListener('click', () => {
					if (on_close != undefined) on_close();
					ctnr.remove();
				});
		
		let txt = document.createElement('p');
				txt.innerHTML = text;
	
		let btn = document.createElement('button');
				btn.innerHTML = button;
				btn.addEventListener('click', () => { if (on_accept != undefined) on_accept(); });
	
		ctnr.append(x);
		ctnr.append(txt);
		ctnr.append(btn);
		document.getElementsByTagName('body')[0].prepend(ctnr);
	}

	ios_promote_app_install() {
		if (document.getElementById('iosappinstall') == undefined) {
			page.classList.add('noscroll');
		
			let ctr = document.createElement('div');
					ctr.id = 'iosappinstall';
			
			let x = document.createElement('span');
					x.classList.add('icon-close');
					x.addEventListener('click', () => {
						setCookie('pwa_app', 'denegated', 7);
						page.classList.remove('noscroll');
						ctr.remove();
					});
			
			let title = document.createElement('h1');
					title.innerHTML = lang.ios_app_promotion;
	
			let textone = document.createElement('p');
					textone.innerHTML = lang.ios_app_promotion_textone;
				
			let texttwo = document.createElement('p');
					texttwo.innerHTML = lang.ios_app_promotion_texttwo;
	
			ctr.append(x);
			ctr.append(title);
			ctr.append(textone);
			ctr.append(texttwo);
		
			document.getElementsByTagName('body')[0].prepend(ctr);
		}
	}

	// Instala la app
	async install() {

		// Muestra el cuadro de instalación
		const install_prompt = async () => {
			this.custom_prompt.prompt();
			const { outcome } = await this.custom_prompt.userChoice;
			return outcome;
		}

		// Callback cuando fue instalada la app
		const on_installed = () => {
			document.getElementById('appinstall').remove();
			setCookie('pwa_app', 'installed', 7);
			this.custom_prompt = null;
		}


		let user_choice = await install_prompt();
		if(user_choice == 'accepted') on_installed();
	}

	// Acutaliza la app
	update(registration) {
		registration.waiting.postMessage({new_worker: 'skip_waiting'});
	}

	// Solicita al usuario permisos para notificaciones
	async sw_notification_permission(reg) {
		const permission = await window.Notification.requestPermission();
		if (permission === 'granted' && navigator.serviceWorker.controller) await this.push_subscribe(reg);
	}

	// Se suscribe al servicio de notificaciones push
	async push_subscribe(reg) {
		if (navigator.onLine) {
			this.push_subscription = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(this.PUBLIC_VAPID_KEY)
			});
		
			await fetch('/api/notifications/subscription', { 
				method: 'POST',
				body: JSON.stringify(this.push_subscription),
				headers: { "Content-Type": "application/json" }
			}).catch(e => { console.error(e); });
		}
	}

	// Envía una orden de limpieza de cache al service worker
	clear_cache() {
		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({cache_clear: true});
		}
	}


	// Determina si el sistema operativo del cliente es de apple
	get is_ios() {
		const ios_list = [ 'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod' ];
		const is_ios = ios_list.includes(navigator.platform);
		const is_mac = (navigator.userAgent.includes("Mac") && "ontouchend" in document);
		return is_ios || is_mac;
	}

	// Determina si se debe promover la instalación de la app
	get should_promote() {
		const pwa_app = getCookie('pwa_app');
		return (pwa_app != 'denegated') && (pwa_app != 'installed');
	}

	// Determina si la app ya está instalada
	get is_installed() {
		return ('standalone' in window.navigator) && (window.navigator.standalone);
	}

	// Obtiene la versión
	get version() {
		return this.app_version;
	}
}

let app = new App();
app.start();