import alert from '/lib/dist/alerts.class.js';
import { News } from '../../lib/data.classes.js';




// - - - - - - - - - - - - - - - - - - - - - - - -
// - ACTUALIZACIÓN AUTOMÁTICA                    -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Cantidad de entradas a obtener por cada actualizacion
const refresh_quant = 8;


// Página actual (al principio es 1)
let page = 1;


// Lista de todos los items actualmente desplegados
let item_list = document.getElementById('petlist');


// Si hay una búsqueda la establece como variable
const search = (window.location.pathname.includes('search')) ? new URL(window.location.href).searchParams.get('q') : null;


// Modelo de entrada para ser replicado
const template = document.getElementById('entry').content.querySelector('.pet_entry');

// Variables para noticias
let news_since = JSON.stringify(new Date()).replaceAll('"', '');
let news_until = JSON.stringify(new Date(0)).replaceAll('"', '');


// Genera una nueva entrada con la información dada
const new_item = (id, pn, pa, pr, dd, dp, d, p) => {
	let item = template.cloneNode(true);
	item.setAttribute('href', '/pet/info/' + id);
	item.childNodes[0].setAttribute('src', p);
	item.childNodes[0].setAttribute('alt', pn);
	item.childNodes[0].addEventListener('error', (e) => img_error(e));
	item.childNodes[1].childNodes[0].innerHTML = pn;
	item.childNodes[1].childNodes[1].innerHTML = dd;
	item.childNodes[1].childNodes[2].innerHTML = d;
	return item;
}


// Solicita al servidor una nueva pagina de entradas siguiendo la configuración establecida
async function request_entries() {

	try {
		let request = await fetch(`/api/pets/${(search == null) ? `nearby?limit=${refresh_quant}&page=${page}` : `search?q=${search}&limit=${refresh_quant}&page=${page}`}`);
		request = await request.json();
		page++;
		return request;
	} catch (error) {
		// En caso de error muestra un error fatal diciendo que hubo un error
		throw error;
	}

}


// Añade las entradas que deben encontrarse en forma un objeto
async function append_entries(entries) {
	let e = entries.results;

	// Establece el punto máximo del intervalo de petición de noticias
	// igual al máximo de tiempo de esta página de mascotas
	news_until = (e.length > 0) ? e[e.length - 1].disappearance_date : news_until;

	// Crea la clase de noticias y las pide
	let news = new News({ get: 'period', interval: { since: news_since, until: news_until }, type: 'list', manual: false });
	let news_list = await news.request();

	// Combina las noticias con las mascotas
	if (!news_list.empty) {
		e = [...e, ...news_list];
		e = e.sort(function (a, b) {
			a = new Date(a.createdAt || a.disappearance_date);
			b = new Date(b.createdAt || b.disappearance_date);
			return b - a;
		});
	}

	// Establece el nuevo piso partiendo de acá
	news_since = news_until;

	let load = item_list.getElementsByClassName('loading')[0];
	if (load != undefined) load.remove();

	const add_pet_to_list = (item) => {

		// RELACIONES DE REFERENCIA
		// 1 sec ->        1000 ms
		// 1 min ->       60000 ms
		// 1 h   ->     3600000 ms
		// 1 d   ->    86400000 ms
		// 1 w   ->   604800000 ms
		// 1 m   ->  2592000000 ms
		// 1 y   -> 31536000000 ms

		// Conversión del tiempo a un formato legible
		const test_time = new Date() - new Date(item.disappearance_date); // Diferencia de tiempo en milisegundos

		if (test_time < 60000) {

			// Si pasó menos de un minuto, se calculan los segundos
			// 1000 -> sec
			const second = Math.floor(test_time / (1000));
			const period = second > 1 ? lang.periods.second[1] : lang.periods.second[0];
			item.disappearance_date = lang.missing + ' ' + second + ' ' + period;

		} else if (test_time < 3600000) {

			// Si pasó menos de una hora, se calculan los minutos
			// 1000 -> sec / 60 -> m
			const minute = Math.floor(test_time / (1000 * 60));
			const period = minute > 1 ? lang.periods.minute[1] : lang.periods.minute[0];
			item.disappearance_date = lang.missing + ' ' + minute + ' ' + period;

		} else if (test_time < 86400000) {

			// Si pasó menos de un día, se calculan las horas
			// 1000 -> sec / 60 -> min / 60 -> h
			const hour = Math.floor(test_time / (1000 * 60 * 60));
			const period = hour > 1 ? lang.periods.hour[1] : lang.periods.hour[0];
			item.disappearance_date = lang.missing + ' ' + hour + ' ' + period;

		} else if (test_time < 604800000) {

			// Si pasó menos de una semana, se calculan los días
			// 1000 -> sec / 60 -> min / 60 -> h / 24 -> d
			const day = Math.floor(test_time / (1000 * 60 * 60 * 24));
			const period = day > 1 ? lang.periods.day[1] : lang.periods.day[0];
			item.disappearance_date = lang.missing + ' ' + day + ' ' + period;

		} else if (test_time < 2592000000) {

			// Si pasó menos de un mes, se calculan las semanas
			// 1000 -> sec / 60 -> min / 60 -> h / 24 -> d / 7 -> sem
			const week = Math.floor(test_time / (1000 * 60 * 60 * 24 * 7));
			const period = week > 1 ? lang.periods.week[1] : lang.periods.week[0];
			item.disappearance_date = lang.missing + ' ' + week + ' ' + period;

		} else if (test_time < 31536000000) {

			// Si pasó menos de un año, se calculan los meses
			// 1000 -> sec / 60 -> min / 60 -> h / 24 -> d / 30 -> m
			const month = Math.floor(test_time / (1000 * 60 * 60 * 24 * 30));
			const period = month > 1 ? lang.periods.month[1] : lang.periods.month[0];
			item.disappearance_date = lang.missing + ' ' + month + ' ' + period;

		} else {

			// Si pasó más de un año, se calculan los años
			// 1000 -> sec / 60 -> min / 60 -> h / 24 -> d / 30 -> m / 12 -> y
			const year = Math.floor(test_time / (1000 * 60 * 60 * 24 * 30 * 12));
			const period = year > 1 ? lang.periods.year[1] : lang.periods.year[0];
			item.disappearance_date = lang.missing + ' ' + year + ' ' + period;

		}

		// Se añade a la lista, haciéndose visible
		item_list.appendChild(new_item(item.id, item.pet_name, item.pet_animal, item.pet_race, item.disappearance_date, item.disappearance_place, item.details, item.picture))

	}

	// Para cada entrada...
	for (let i = 0; i < e.length; i++) {

		if (e[i].disappearance_date != undefined) {

			// Convierte la fecha a un formato legible
			add_pet_to_list(e[i]);

		} else if (e[i].createdAt != undefined) {

			item_list.appendChild(news.create_item(e[i]));

		}
	}
}


// Detecta cuando es necesario realizar una nueva petición
async function check_if_need_entries() {
	// Si la pantalla está suficientemente abajo...
	if (window.scrollY + window.innerHeight > item_list.offsetHeight) {
		// Añade las entradas
		await add_entries();
	}
}


// Detecta cuando es necesario añadir mas entradas
async function add_entries() {

	window.removeEventListener('scroll', check_if_need_entries);

	try {
		// Se solicita la información al servidor
		const entries = await request_entries();
		if (entries.name && entries.message) throw entries;
		append_entries(entries);

		const actual_entries = document.querySelectorAll('.pet_entry');
		if (search != undefined && entries.next.results == 0 && entries.next.total == 1 && actual_entries.length == 0) {
			const pet_list = document.querySelector('#petlist');
			pet_list.innerHTML = `<div class="not_results"><span class="icon-emotion-unhappy"></span><h1>${lang.results_not_found}</h1></div>`
		}

		// Se vuelve a hacer scrolleable
		window.addEventListener('scroll', check_if_need_entries);

		// Si ya no quedan entradas por mostrar...
		if (entries.results == 0) {

			support_us('#body');
			// Se desactiva definitivamente el listener
			window.removeEventListener('scroll', check_if_need_entries);
		}
	} catch (error) {
		// En caso de error interrumpe el funcionamiento de la página notificando que algo salió mal
		return alert.fatal({
			icon: 'icon-thumb-down',
			title: lang.clienterror.went_wrong,
			buttons: [
				{ text: lang.retry, action: () => window.location.reload() },
				{ text: lang.goback, action: () => window.history.back() }
			]
		});
	}
}


// Escucha principal al scroll de la página para solicitar nuevas entradas
window.addEventListener('scroll', check_if_need_entries);

window.addEventListener('load', async () => add_entries());




// - - - - - - - - - - - - - - - - - - - - - - - -
// - BOTÓN DE BÚSQUEDA                           -
// - - - - - - - - - - - - - - - - - - - - - - - -


const search_button = document.getElementById('search_button');
let search_input = document.getElementById('search_input');
search_button.onclick = function () {
	if (search_input.value != '') {
		const url = new URL(`/search?q=${search_input.value}`, window.location.origin);
		window.location.href = url.href;
	} else {
		window.location.href = '/';
	}
};


search_input.addEventListener('keyup', (e) => {
	if (e.key == 'Enter') {
		e.preventDefault();
		search_button.click();
	}
});


function input_set_search() {
	search_input.value = search;
}


window.onload = input_set_search();