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






class App {

	constructor(lang) {
		this.body = document.getElementsByTagName('body')[0];
		this.new_worker;
		this.custom_prompt;
		this.worker;
		this.push_subscription;
		this.PUBLIC_VAPID_KEY = 'BOSzT7DyMkEwzE27m1lGmGeg7nWYdFE552Y9UxqAyGT2JiJOgTTuGTFIrOHzvCGlaKBZaJmD4RNjtPQ6BbryUSY';
		this.app_version = '';
    this.lang = lang;
	}

	// Inicia la app
	start() {

		// Determina si la aplicación es instalable e inicia el proceso
		const on_installable = () => {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				this.custom_prompt = e;
				const pwa_app = getCookie('pwa_app');
				if (pwa_app == '') this.promote_app_install();
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
				switch (e.data.cache_clear) {
					case 'done':
						
						break;
					case 'error':
					
						break;
					default:
						break;
				}
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
		navigator.serviceWorker.ready.then(async (reg) => reg.active.postMessage({ lang: this.lang }));
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

export { App };
export default App;