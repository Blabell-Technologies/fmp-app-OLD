import alert from '/lib/dist/alerts.class.js';

const button = document.getElementById('data-navigator');


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


function recur(obj) {
  var result = {}, _tmp;
  for (var i in obj) {
    if (i === 'enabledPlugin' || typeof obj[i] === 'function') {
      continue;
    } else if (typeof obj[i] === 'object') {
        _tmp = recur(obj[i]);
        if (Object.keys(_tmp).length) {
          result[i] = _tmp;
        }
    } else {
      result[i] = obj[i];
    }
  }
  return result;
}


button.addEventListener('click', async () => { 
  alert.info({
      title: lang.device_not_supported.modal1.title, 
      text: lang.device_not_supported.modal1.text,
      buttons: [
				// More info
        // Pliaj informoj
				{text: 'Más información', type: 'primary', action: () => {
					alert.modal.destroy();
					alert.info({
						// 
            // 
						title: lang.device_not_supported.modal2.title,
						text: lang.device_not_supported.modal2.text,
						buttons: [
							// Know more
              // Sciu pli
							{text: 'Saber más', type: 'primary', action: () => {window.location.href = 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator'} },
							// Send
              // Sendu
              {text: 'Enviar', type: 'primary', action: async () => device_info() }
						]
					});
				}},
				{text: 'Enviar', type: 'primary', action: async () => device_info() }
      ]
  })
});


async function device_info() {
	if (getCookie('dev_data') != 'true') {
		alert.modal.destroy();
		alert.info({
			title: lang.device_not_supported.modal3.title,
			text: lang.device_not_supported.modal3.text
		});
		try { 
			const _nav = recur(navigator);
	
			let data = await fetch('/api/dns', { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' }, 
				body: JSON.stringify({ navigator: _nav })
			});
	
			if (data.status == 200) {
				setCookie('dev_data', true, 7);
				alert.modal.destroy();
				alert.info({
					icon: 'icon-thumb-up',
					title: lang.device_not_supported.modal4.title,
          text: lang.device_not_supported.modal4.text
				});
			} else {
				alert.modal.destroy();
				alert.error({
					icon: 'icon-thumb-down',
					title: lang.device_not_supported.modal5.title,
					text: lang.device_not_supported.modal5.text,
					buttons: [
						// Retry
            // Ripetu
						{text: 'Reintentar', type: 'primary', action: async () => device_info() }
					]
				});
			}

			return null;
	
		} catch (err) {
			console.error(err);
		}
	} else {
		alert.modal.destroy();
		alert.error({
			icon: 'icon-thumb-down',
			title: lang.device_not_supported.modal6.title,
			text: lang.device_not_supported.modal6.text
		});
	}
}

window.addEventListener('load', () => {
	if (navigator.serviceWorker.controller) {
		console.log('Sending');
		navigator.serviceWorker.controller.postMessage({ clear_cache: true });
	}
})