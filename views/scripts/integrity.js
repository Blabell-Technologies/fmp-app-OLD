import alert from '/lib/dist/alerts.class.js';


// Advierte que la página mostrada es un error o no pertenece al sistema y recarga toda la app
function check_integrity() {

	// Busca un elemento clave
	const doc = document.getElementById('fmp');

	// Si no está y existe un service worker activo previamente
	if (doc == undefined) {

		// Solicita al service worker una recarga completa de la app
		if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ msg: 'reload'});
		return;

	// En caso de que ese elemento esté...
	} else {

		// Busca un segundo elemento clave que solo aparece en caso de error
		const err = document.getElementById('fmp_error');

		// En caso de que exista...
		if (err != undefined) {

			if (navigator.serviceWorker.controller) {
				navigator.serviceWorker.addEventListener('message', (e) => {
					if (e.data.code != undefined) {
						
						// Muestra un error fatal
						alert.fatal({
							icon: 'icon-thumb-down',
							title: (!navigator.onLine) ? lang.clienterror.offline : (e.data.code > 500) ? lang.clienterror.server_fail : lang.clienterror.page_not_found,
							buttons: [
								{ text: lang.retry, action: () => location.reload() },
								{ text: lang.goback, action: () => window.history.back()}
							]
						});
					}
				});
				navigator.serviceWorker.controller.postMessage({ fail: true });
			} else {

				// Muestra un error fatal
				alert.fatal({
					icon: 'icon-thumb-down',
					title: (!navigator.onLine) ? lang.clienterror.offline : lang.clienterror.page_not_found,
					buttons: [
						{ text: lang.retry, action: () => location.reload() },
						{ text: lang.goback, action: () => window.history.back()}
					]
				});
			}
		}
	}
}


window.onload = () => check_integrity();