

// Establece el lenguaje
function setLanguage(iso639) {
	setCookie('lang', iso639, 7);
	if(navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ lang: iso639 });
	location.reload();
}


// Obtención del apartado Aplicación
let ctnr = document.getElementById('app');


// Genera el boton de descarga en la configuración cuando la instalación este disponible
window.addEventListener('beforeinstallprompt', (e) => {

	if (document.querySelector('#block_appinstall') == undefined) {
		// Botón de instalación
		let btn = document.createElement('button');
			btn.id = 'block_appinstall';
			btn.innerHTML = lang.installapp;
			btn.addEventListener('click', () => install_app(e));
	
		// Añadido a los elementos y al documento
		ctnr.appendChild(btn);
	}

});



async function show_version() {
	ctnr.appendChild(info(lang.last_version, await check_version() || '...'));
	if (navigator.serviceWorker.controller) {
		navigator.serviceWorker.addEventListener('message', (e) => {
			if (e.data.msg) ctnr.appendChild(info(lang.actual_version, e.data.msg || '...'));
		});
		navigator.serviceWorker.controller.postMessage({ version: 'check' });
	}
	
}


// Devuelve una linea de información
const info = (key, value, twoline = false) => {

	// Contenedor
	let ctnr = document.createElement('div');
		ctnr.classList.add(twoline ? 'twolines' : 'oneline');
	
	// Título
	let title = document.createElement('h4');
		title.innerHTML = key;
  
	// Texto
	let text = document.createElement('p');
		text.innerHTML = value;
  
	// Unión
	ctnr.appendChild(title);
	ctnr.appendChild(text);
  
	// Retorno
	return ctnr;
}



// Creador de select personalizado
function create_select(className) {
	var x, i, j, l, ll, selElmnt, a, b, c;
	
	// Buscar elementos con la clase solicitada
	x = document.getElementsByClassName(className);
	l = x.length;
	for (i = 0; i < l; i++) {

		// Obtener los select y sus entradas
		selElmnt = x[i].getElementsByTagName("select")[0];
		ll = selElmnt.length;

		// Crear para cada select un div que actúa como opción seleccionada
		a = document.createElement("DIV");
		a.setAttribute("class", "select-selected");
		a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
		x[i].appendChild(a);

		// Crear para cada select un div que contenga la lista de opciones
		b = document.createElement("DIV");
		b.setAttribute("class", "select-items select-hide");
		for (j = 1; j < ll; j++) {

			// Para cada opción dentro del select se crea un div que actúe como item
			c = document.createElement("DIV");
			c.innerHTML = selElmnt.options[j].innerHTML;
			if (c.innerHTML == a.innerHTML) c.classList.add('same-as-selected');

			// Escucha de un click en cada item
			c.addEventListener("click", async function (e) {

				// Cuando un item es clickeado se actualiza el select original y la opción seleccionada
				var y, i, k, s, h, sl, yl;
				s = this.parentNode.parentNode.getElementsByTagName("select")[0];
				sl = s.length;
				h = this.parentNode.previousSibling;
				for (i = 0; i < sl; i++) {
					if (s.options[i].innerHTML == this.innerHTML) {
						s.selectedIndex = i; // Actualización del valor del select original

						// Actualización del lenguaje
						setLanguage(s.options[i].value);

						// Actualización del valor del select modificado
						h.innerHTML = this.innerHTML;
						y = this.parentNode.getElementsByClassName("same-as-selected");
						yl = y.length;
						for (k = 0; k < yl; k++) {
							y[k].removeAttribute("class");
						}
						this.setAttribute("class", "same-as-selected");
						break;
					}
				}
				h.click();
			});
			b.appendChild(c);
		}
		x[i].appendChild(b);
		a.addEventListener("click", function (e) {
			// Cerrar los demás select cuando uno sea clickeado
			e.stopPropagation();
			closeAllSelect(this);
			this.nextSibling.classList.toggle("select-hide");
			this.classList.toggle("select-arrow-active");
		});
	}
}



// Cierra todos los select
function closeAllSelect(elmnt) {
	// Cerrar todos los select excepto el que esté en uso
	var x, y, i, xl, yl, arrNo = [];
	x = document.getElementsByClassName("select-items");
	y = document.getElementsByClassName("select-selected");
	xl = x.length;
	yl = y.length;
	for (i = 0; i < yl; i++) {
		if (elmnt == y[i]) {
			arrNo.push(i)
		} else {
			y[i].classList.remove("select-arrow-active");
		}
	}
	for (i = 0; i < xl; i++) {
		if (arrNo.indexOf(i)) {
			x[i].classList.add("select-hide");
		}
	}
}

// Cerrar siempre que se haga click fuera del select
window.addEventListener("click", closeAllSelect);


// Crear los select personalizados al cargar el documento
window.onload = () => {
	create_select('custom-select');
	show_version();
	support_us('#body');

	// const vh2 = document.createElement('h2');
	// vh2.innerText = app_version;
	// document.querySelector('#body').appendChild(vh2);
}	
