import alert from '/lib/dist/alerts.class.js';
import { News } from '/lib/data.classes.js';
import { SearchBar } from '/lib/searchbar.class.js';

// Si hay una búsqueda la establece como variable
const search = (window.location.pathname.includes('search')) ? new URL(window.location.href).searchParams.get('q') : null;

new SearchBar({
	previous_search: search
});

// - - - - - - - - - - - - - - - - - - - - - - - -
// - ACTUALIZACIÓN AUTOMÁTICA                    -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Cantidad de entradas a obtener por cada actualizacion
const refresh_quant = 8;


// Página actual (al principio es 1)
let page = 1;


// Lista de todos los items actualmente desplegados
let item_list = document.getElementById('petlist');


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
	
	try {

		if (e == undefined) throw 'no_entries';

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
	} catch (error) {
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



// TODO: Reestructurar la petición de información listada

// class PetList {

// 	constructor(target, config = {}) {
// 		this.target = (typeof(target) == 'string') ? document.querySelector(target) : target;
// 		this.url = config.url || window.location;
// 		this.page_length = config.pageLenght || 8;
		
// 		this.search = (this.url.pathname.includes('search')) ? new URL(this.url.href).searchParams.get('q') : null;
// 		this.page = 0;

// 		this.news_since = JSON.stringify(new Date()).replaceAll('"', '');
// 		this.news_until = JSON.stringify(new Date(0)).replaceAll('"', '');
// 		this.detect_scroll = false;

// 		this.create();
// 	}


// 	create() {
// 		try {
// 			this.request_data();
// 			this.detect_scroll = true;
// 			window.addEventListener('scroll', () => this.check_if_need_items());
// 		} catch (error) {
// 			this.on_list_error(error);
// 		}
// 	}

// 	// Determina si es necesario pedir más entradas
// 	// y lo hace en caso de ser necesario
// 	check_if_need_items() {
// 		if (this.detect_scroll && window.scrollY + window.innerHeight > this.target.offsetHeight) {
// 			this.request_data();
// 		}
// 	}

// 	// Solicita información al servidor y en caso de
// 	// que no hayan resultados se lo notifica al usuario
// 	async request_data() {

// 		// Crea la solicitud
// 		const request_items = async () => {

// 			// Genera la url correspondiente para pedir los datos
// 			const new_url = () => {
// 				let url = new URL(window.location.origin + '/api/pets' );
// 				url.searchParams.append('limit', this.page_length);
// 				url.searchParams.append('page', this.page);
// 				if (this.search != undefined) {
// 					url.searchParams.append('q', this.search);
// 					url.pathname += '/search';
// 					return url;
// 				}
// 				url.pathname += '/nearby';
// 				return url;
// 			}

// 			try {
// 				const url = new_url();
// 				let data = await fetch(url);
// 						data = await data.json();

// 				this.page++;
// 				return data;

// 			} catch (error) {
// 				throw error;
// 			}
// 		}

// 		// Muestra un mensaje de que no hay resultados
// 		const no_results = () => {

// 			console.log('nr');

// 			let div = document.createElement('div');
// 					div.classList.add('not_results');

// 			let span = document.createElement('span');
// 					span.classList.add('icon-emotion-unhappy');

// 			let h1 = document.createElement('h1');
// 					h1.textContent = lang.results_not_found;

// 			div.appendChild(span);
// 			div.appendChild(h1);

// 			this.target.innerHTML = '';
// 			this.target.appendChild(div);
// 		}

		
// 		try {
// 			this.detect_scroll = false;

// 			const data = await request_items();
// 			if (data.results.length == 0 && data.next.results == 0) {
// 				if (this.target.childNodes.length == 0) return no_results();
// 				else support_us(this.target);
// 			} else {
// 				this.append_items(data);
// 				this.detect_scroll = true;
// 			}

// 		} catch (error) {
// 			this.on_list_error(error);
// 		}
// 	}

// 	// Añade items a la lista
// 	async append_items(items) {

// 		items = items.results;

// 		// RELACIONES DE REFERENCIA
// 		// 1 sec ->        1000 ms
// 		// 1 min ->       60000 ms
// 		// 1 h   ->     3600000 ms
// 		// 1 d   ->    86400000 ms
// 		// 1 w   ->   604800000 ms
// 		// 1 m   ->  2592000000 ms
// 		// 1 y   -> 31536000000 ms
// 		const time_converter = {
// 			second: 1000,				// 1000 -> 1 sec
// 			minute: 60000, 			// 1000 -> 1 sec * 60 -> 1 m
// 			hour: 3600000,			// 1000 -> 1 sec * 60 -> 1 min * 60 -> 1 hour
// 			day: 86400000,			// 1000 -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day
// 			week: 60480000,			// 1000 -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 7 -> 1 week
// 			month: 2592000000,	// 1000 -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 30 -> 1 month
// 			year: 31104000000		// 1000 -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 30 -> 1 month * 12 -> 1 year
// 		}

// 		// Transforma el tiempo de ms UNIX a "perdido hace x días"
// 		const parse_time = (time) => {

// 			// Obtiene el tiempo pasado
// 			const get_period = (time_passed) => {
// 				for (const period in time_converter) {
// 					if (time_passed < time_converter[period]) {
// 						console.log(`[${period}] ${time_converter[period]} > ${time_passed}`);
// 						return {period: time_converter[period], type: period}
// 					}
// 				}
// 			}

// 			time = new Date() - new Date(time);
// 			const factor = get_period(time);
// 			const since = Math.floor(time / factor.period);
// 			const timeframe = since > 1 ? lang.periods[factor.type][1] : lang.periods[factor.type][0];
// 			return lang.missing + ' ' + since + ' ' + timeframe;
// 		}

// 		// Obtiene las noticias y las combina con las mascotas
// 		const get_news = async (items) => {

// 			this.news_until = (items.length > 0) ? items[items.length - 1].disappearance_date : this.news_until;
			
// 			// Crea la clase de noticias y las pide
// 			let news = new News({
// 				get: 'period',
// 				type: 'list',
// 				manual: false,
// 				interval: {
// 					since: this.news_since,
// 					until: this.news_until
// 				}
// 			});
// 			let news_list = await news.request();
		
// 			// Combina las noticias con las mascotas
// 			if (!news_list.empty) {
// 				items = [...items, ...news_list];
// 				items = items.sort(function (a, b) {
// 					a = new Date(a.createdAt || a.disappearance_date);
// 					b = new Date(b.createdAt || b.disappearance_date);
// 					return b - a;
// 				});
// 			}

// 			this.news_since = this.news_until;

// 			return news;
// 		}

// 		// Elimina la animación de carga si se encuentra
// 		const remove_loading = () => {
// 			let load = this.target.getElementsByClassName('loading')[0];
// 			if (load != undefined) load.remove();
// 		}

// 		// Añade un item de mascota a la lista
// 		const append_pet = (info) => {
// 			info.disappearance_date = parse_time(info.disappearance_date);;
// 			let item = this.create_item(info);
// 			this.target.appendChild(item);
// 		}

// 		// Añade una noticia a la lista
// 		const append_news = (info, news_class) => {
// 			let item = news_class.create_item(info);
// 			this.target.appendChild(item);
// 		}

		
// 		let news = await get_news(items);
// 		remove_loading();

// 		console.log(items);

// 		for (const item of items) {
// 			if (item.disappearance_date != undefined) append_pet(item);
// 			else if (item.createdAt != undefined) append_news(item, news);
// 		}
// 	}

// 	// Genera un item para la lista
// 	create_item({id, pet_name, disappearance_date, details, picture}) {

// 		let a = document.createElement('a');
// 				a.classList.add('pet_entry');
// 				a.setAttribute('href', '/pet/info/' + id);

// 		let img = document.createElement('img');
// 				img.setAttribute('src', picture);
// 				img.setAttribute('alt', pet_name);
// 				img.addEventListener('error', (e) => img_error(e));

// 		let div = document.createElement('div');

// 		let h3 = document.createElement('h3');
// 				h3.textContent = pet_name;

// 		let h4 = document.createElement('h4');
// 				h4.textContent = disappearance_date;

// 		let p = document.createElement('p');
// 				p.textContent = details;

// 		div.appendChild(h3);
// 		div.appendChild(h4);
// 		div.appendChild(p);

// 		a.appendChild(img);
// 		a.appendChild(div);

// 		return a;
// 	}

// 	// Muestra un alerta fatal en caso de cualquier error
// 	on_list_error(error) {
// 		console.error(error);
// 		return alert.fatal({
// 			icon: 'icon-thumb-down',
// 			title: lang.clienterror.went_wrong,
// 			buttons: [
// 				{ text: lang.retry, action: () => window.location.reload() },
// 				{ text: lang.goback, action: () => window.history.back() }
// 			]
// 		});
// 	}

// }

// new PetList('#petlist');