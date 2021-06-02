import alert from '/lib/dist/alerts.class.js';
import { News } from '/lib/data.classes.js';
import { SearchBar } from '/lib/searchbar.class.js';

// Si hay una búsqueda la establece como variable
const search = (window.location.pathname.includes('search')) ? new URL(window.location.href).searchParams.get('q') : null;

new SearchBar({
	previous_search: search
});


class PetList {

	constructor(target, config = {}) {
		this.target = (typeof(target) == 'string') ? document.querySelector(target) : target;
		this.url = config.url || window.location;
		this.page_length = config.pageLenght || 8;
		
		this.search = (this.url.pathname.includes('search')) ? new URL(this.url.href).searchParams.get('q') : null;
		this.page = 0;
		this.assign_key = 0;

		this.news_since = JSON.stringify(new Date()).replaceAll('"', '');
		this.news_until = JSON.stringify(new Date(0)).replaceAll('"', '');
		this.detect_scroll = false;

		// RELACIONES DE REFERENCIA
		// 1 sec ->        1000 ms
		// 1 min ->       60000 ms
		// 1 h   ->     3600000 ms
		// 1 d   ->    86400000 ms
		// 1 w   ->   604800000 ms
		// 1 m   ->  2592000000 ms
		// 1 y   -> 31536000000 ms
		this.time_converter = {
			second: 			1000,		// 1000 ms -> 1 sec
			minute: 		 60000, 	// 1000 ms -> 1 sec * 60 -> 1 m
			hour: 		 3600000,		// 1000 ms -> 1 sec * 60 -> 1 min * 60 -> 1 hour
			day: 			86400000,		// 1000 ms -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day
			week: 	 604800000,		// 1000 ms -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 7 -> 1 week
			month: 	2592000000,		// 1000 ms -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 30 -> 1 month
			year:  31536000000		// 1000 ms -> 1 sec * 60 -> 1 min * 60 -> 1 hour * 24 -> 1 day * 30 -> 1 month * 12 -> 1 year
		}

		this.create();
	}


	async create() {

		try {
			let data = await this.request_pets();
			if (data != undefined) this.handle_response(data);
			window.addEventListener('scroll', () => this.check_if_need_items());
		} catch (error) {
			this.on_list_error(error);
		}
	}



	async handle_response(data) {

		// Muestra un mensaje de que no hay resultados
		const no_results = () => {

			let div = document.createElement('div');
					div.classList.add('not_results');

			let span = document.createElement('span');
					span.classList.add('icon-emotion-unhappy');

			let h1 = document.createElement('h1');
					h1.textContent = lang.results_not_found;

			div.appendChild(span);
			div.appendChild(h1);

			this.target.innerHTML = '';
			this.target.appendChild(div);
		}

		// Añade noticias al final en caso de que queden
		// algunas por mostrar después de la mascota
		// mas antigua
		const append_final_news = async () => {
			let { news, list } = await this.request_news(this.news_since, new Date(0));
			if (!list.empty && list.error == undefined) {
				this.remove_loading();
				for (const info of list) {
					let item = news.create_item(info);
					this.target.appendChild(item);
				}
			}
		}


		try {
			if (data.results.length > 0) await this.append_items(data);
			if (data.next.next == false) {
				if (this.target.childNodes.length == 0) return no_results();
				await append_final_news();
				support_us(this.target);
			} else {
				this.detect_scroll = true;
			}
		} catch (error) {
			console.error(error);
		}


	}


	// Determina si es necesario pedir más entradas
	// y lo hace en caso de ser necesario
	async check_if_need_items() {
		if (this.detect_scroll && window.scrollY + window.innerHeight > this.target.offsetHeight - 300) {
			this.detect_scroll = false;
			const data = await this.request_pets();
			if (data != undefined) this.handle_response(data);
		}
	}


	// Solicita información al servidor y en caso de
	// que no hayan resultados se lo notifica al usuario
	async request_pets() {

		// Crea la solicitud
		const request_items = async () => {

			// Genera la url correspondiente para pedir los datos
			const new_url = () => {
				let url = new URL(window.location.origin + '/api/pets' );
				url.searchParams.append('limit', this.page_length);
				url.searchParams.append('page', this.page);
				if (this.search != undefined) {
					url.searchParams.append('q', this.search);
					url.pathname += '/search';
					return url;
				}
				url.pathname += '/nearby';
				return url;
			}

			try {
				const url = new_url();
				let data = await fetch(url);
						data = await data.json();

				this.page++;
				return data;

			} catch (error) {
				throw error;
			}
		}

		
		try {
			const data = await request_items();
			return data;
		} catch (error) {
			this.on_list_error(error);
		}
	}


	// Solicita las noticias en un período especificado
	async request_news(since, until) {

		// Crea la clase de noticias y las pide
		let news = new News({
			get: 'period',
			type: 'list',
			manual: false,
			interval: { since, until }
		});
		let list = await news.request();
		return {news, list};
	}


	// Añade items a la lista
	async append_items(items) {

		items = items.results;

		// Transforma el tiempo de ms UNIX a "perdido hace x días"
		const parse_time = (time) => {

			// Obtiene la unidad y el valor del tiempo pasado
			const get_period = (time_passed) => {
				var result = { amount: Number.MAX_SAFE_INTEGER };
				for (const unit in this.time_converter) {
					let amount = Math.floor(time_passed / this.time_converter[unit]);
					if (amount != 0 && amount < result.amount) result = { unit, amount };
				}
				return result;
			}

			time = new Date() - new Date(time);
			let { unit, amount } = get_period(time);
			unit = amount > 1 ? lang.periods[unit][1] : lang.periods[unit][0];
			return lang.missing + ' ' + amount + ' ' + unit;
		}

		// Obtiene las noticias y las combina con las mascotas
		const get_news = async (items) => {

			this.news_until = (items.length > 0) ? items[items.length - 1].disappearance_date : this.news_until;
			let { news, list } = await this.request_news(this.news_since, this.news_until);
			this.news_since = this.news_until;

			// Combina las noticias con las mascotas
			if (!list.empty && list.error == undefined) {
				items = [...items, ...list].sort(function (a, b) {
					a = new Date(a.createdAt || a.disappearance_date);
					b = new Date(b.createdAt || b.disappearance_date);
					return b - a;
				});
			}

			return {news, list: items};
		}

		// Añade un item de mascota a la lista
		const append_pet = (info) => {
			info.disappearance_date = parse_time(info.disappearance_date);;
			let item = this.create_item(info);
			this.target.appendChild(item);
		}

		// Añade una noticia a la lista
		const append_news = (info, news_class) => {
			let item = news_class.create_item(info);
			this.target.appendChild(item);
		}

		
		let { news, list } = await get_news(items);
		this.remove_loading();


		for (const item of list) {
			if (item.disappearance_date != undefined) append_pet(item);
			else if (item.createdAt != undefined) append_news(item, news);
		}
	}


	// Genera un item para la lista
	create_item({id, pet_name, disappearance_date, details, picture}) {

		let a = document.createElement('a');
				a.dataset.key = this.assign_key;
				a.classList.add('pet_entry');
				a.setAttribute('href', '/pet/info/' + id);

		let img = document.createElement('img');
				img.setAttribute('src', picture);
				img.setAttribute('alt', pet_name);
				img.addEventListener('error', (e) => img_error(e));

		let div = document.createElement('div');

		let h3 = document.createElement('h3');
				h3.textContent = pet_name;

		let h4 = document.createElement('h4');
				h4.textContent = disappearance_date;

		let p = document.createElement('p');
				p.textContent = details;

		div.appendChild(h3);
		div.appendChild(h4);
		div.appendChild(p);

		a.appendChild(img);
		a.appendChild(div);

		this.assign_key++;
		return a;
	}

	// Elimina la animación de carga si se encuentra
	remove_loading() {
		let load = this.target.getElementsByClassName('loading')[0];
		if (load != undefined) load.remove();
	}


	// Muestra un alerta fatal en caso de cualquier error
	on_list_error(error) {
		console.error(error);
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

new PetList('#petlist');