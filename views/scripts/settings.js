import { Select } from '/lib/select.class.js';
import { Toast } from '/lib/toast.js';


// Establece el lenguaje
function setLanguage(iso639) {
	setCookie('lang', iso639, 7);
	if(navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ lang: iso639 });
	location.reload();
}


// Obtención del apartado Aplicación
let ctnr = document.getElementById('app');
let custom_prompt;

// Genera el boton de descarga en la configuración cuando la instalación este disponible
window.addEventListener('beforeinstallprompt', (e) => {
	custom_prompt = e;
	if (document.querySelector('#block_appinstall') == undefined) {
		let btn = document.createElement('button');
				btn.id = 'block_appinstall';
				btn.innerHTML = lang.installapp;
				btn.addEventListener('click', async () => {
					if (app.is_ios) app.ios_promote_app_install();
					else {
						custom_prompt.prompt();
						const { outcome } = await custom_prompt.userChoice;
						if(outcome == 'accepted') {
							btn.remove();
							let install_header = document.getElementById('appinstall');
							if (install_header != undefined) install_header.remove();
							setCookie('pwa_app', 'installed', 7);
							custom_prompt = null;
						}
					}
				});
		ctnr.appendChild(btn);
	}
});


function clear_cache_button() {
	let btn = document.getElementById('block_clearcache');
			btn.addEventListener('click', () => {
				if (navigator.serviceWorker) {
					app.clear_cache();
				} else {
					new Toast({
						message: lang.cant_clear_cache,
						type: 'warning'
					});
				}
			});
}


window.onload = () => {
	clear_cache_button();
	support_us('#body');
	new Select('#languageselect', {
		options: [
			{ name: 'Español', value: 'es-ES' }, 
			{ name: 'English', value: 'en-US' }, 
			{ name: 'Esperanto', value: 'eo' }
		],
		keyword: 'language_selector',
		title: lang.language,
		onValueChange: function(new_lang) { setLanguage(new_lang) },
		default: lang.iso639,
		pleaseSelectText: lang.this
	});
	document.getElementsByTagName('body')[0].addEventListener('clearcache', (e) => {
		switch (e.detail) {
			case 'done':
				new Toast({
					message: lang.success_clear_cache,
					type: 'success'
				});
				break;
			case 'error':
				new Toast({
					message: lang.error_clear_cache,
					type: 'warning'
				});
				break;
			default:
				break;
		}
		
	})
}	
