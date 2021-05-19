
/**
 * Administra el input y el botón de búsqueda
 * 
 * @class
 */
class SearchBar {

  /**
   * @param {object} param0 - Configuración
   * @param {string} param0.previous_search - Búsqueda hecha previamente al momento de cargar la página
   */
	constructor({previous_search = ''}) {
		this.search_button = document.getElementById('search_button');
		this.search_button.addEventListener('click', () => this.on_search());

		this.search_input = document.getElementById('search_input');
		this.set_search_value(previous_search);
		this.search_input.addEventListener('keyup', (e) => {
			if (e.key == 'Enter') {
				e.preventDefault();
				this.search();
			}
		});
	}

	// Rellena el input de búsqued con un valor
	set_search_value(value) {
		this.search_input.value = value;
	}

	// Al hacer la búsqueda cambia de página
	on_search(value) {
		if (value != '') {
			const url = new URL(`/search?q=${search_input.value}`, window.location.origin);
			window.location.href = url.href;
		} else {
			window.location.href = '/';
		}
	}

	// Hace la búsqueda
	search() {
		this.search_button.click();
	}

}

export { SearchBar };
export default SearchBar;