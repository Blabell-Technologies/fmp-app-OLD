/**
 * @file Crea y administra inputs autocompletables con direcciones
 * @author Bruno Ferreyra & Santiago de Nicolás
 */

// ---------------------------------------------------------------


/** Input autocompletable
 * 
 * Genera un input autocompletable con direcciones
 * y administra el dom junto con la librería
 * autoComplete.js
 * 
 * @class
 */
class Compleshon {

  constructor(target, config) {
    this.target = document.querySelector(target);
    this.list = new autoComplete({
      selector: target,
      threshold: 3,
      debounce: 450,
      highlight: true,
      noResults: (dataFeedback, generateList) => { this.no_results(dataFeedback, generateList); },
      onSelection: (e) => { this.on_selection(e); },
      searchEngine: (record) => { return record; },
      resultItem: {
        content: (data, source) => { this.result_item(data, source); },
        element: "li"
      },
      data: {
        src: async () => { return await this.ac_src(); },
        cache: false
      }
    });

    // Configuración por defecto
    this.target.dataset.coordinates = config?.default?.coordinates || '';
    this.target.value = config?.default?.address || '';
  }


  // Solicita la lista de sugerencias de calles en base
  // a la búsqueda hecha por el usuario
  async ac_src() {

    // Descifra la calle y la altura
    function get_street(property) {
      let street = [property.street || property.name];
      if (property.housenumber != undefined) street.push(property.housenumber);
      street = street.join(' ');
      return street;
    }

    // Genera una descripción de donde está la casa
    // especificando barrio, suburbio, distrito, estado
    // y/o provincia
    function get_description(property) {
      let description = [];
      if (property.suburb || property.district) description.push(property.suburb || property.district);
      if (property.city) description.push(property.city);
      if (property.state || property.state_district) description.push(property.state || property.state_district);
      description = description.join(', ');
      return description;
    }

    // Solicita los datos de búsqueda a photon
    const request_data = async () => {
      const query = this.target.value;
      let ph_features = await fetch(`https://photon.komoot.io/api/?q=${query}&lat=-34.60367685025505&lon=-58.38159853604474&limit=5`);
          ph_features = await ph_features.json();
      return ph_features.features;
    }

    // Genera un resultado de búsqueda
    function generate_result(data) {
      const { geometry, properties } = data;

      let title = get_street(properties);
      let description = get_description(properties);
      const coordinates = [geometry.coordinates[1], geometry.coordinates[0]];
  
      const result = JSON.stringify({ title, description, coordinates });
      return result;
    }


    const ph_features = await request_data();
    const features = await ph_features.map(feature => generate_result(feature));
    return features;
  }

  // Despliega un item diciendo que no hay resultados
  no_results(data_feedback, generate_list) {

    // Genera el item
    const no_result_item = (target, df) => {

      target = document.querySelector(target);

      let li = document.createElement('li');
          li.setAttribute("class", "no_result");
          li.setAttribute("tabindex", "1");

      let span = document.createElement('span');
          span.textContent = `Found No Results for "${df.query}"`;

      li.appendChild(span);
      target.appendChild(li);
    }

    // Generate autoComplete List
    generate_list(this.list, data_feedback, data_feedback.results);
    no_result_item(`#${this.list.resultsList.idName}`, data_feedback);
  }

  // Callback al seleccionar un item de la lista de sugerencias
  on_selection(event) {
    const selection = JSON.parse(event.selection.value);
    this.target.dataset.coordinates = selection.coordinates;
    this.target.blur();
    this.target.value = `${selection.title} ${selection.description}`;
  }

  // Genera cada item de los resultados
  result_item(data, source) {
    const decoded = JSON.parse(data.value);

    let div = document.createElement('div');

    let icon = document.createElement('i');
        icon.classList.add('icon-map-pin');

    let title = document.createElement('span');
        title.textContent = decoded.title;
    
    let description = document.createElement('span');
        description.textContent = decoded.description;
        
    source.innerHTML = '';
    div.appendChild(icon);
    div.appendChild(title);
    source.appendChild(div);
    source.appendChild(description);
  }

}

export { Compleshon };
export default Compleshon;