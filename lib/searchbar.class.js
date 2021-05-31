
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
		this.search_button.addEventListener('click', () => this.search());

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

	// Hace la búsqueda
	search(value) {
		value = (value != undefined) ? value : this.search_input.value;
		if (value == '') window.location.href = '/';
		else {
			const url = new URL(`/search?q=${search_input.value}`, window.location.origin);
			window.location.href = url.href;
		}
		this.search_button.click();
	}

}

export { SearchBar };
export default SearchBar;