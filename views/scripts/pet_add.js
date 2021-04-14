import * as lib from '/scripts/lib.js';
import alert from '/lib/dist/alerts.class.js';



// - - - - - - - - - - - - - - - - - - - - - - - -
// - IMÁGENES Y LISTAS DE IMÁGENES               -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Obtención del contenedor de la lista de fotos
const photo_list = document.getElementById('photo_list');

// Creación de una plantilla de entrada basándose en la previamente existente
let photo_entry = photo_list.childNodes[0].cloneNode(true);
photo_entry.removeAttribute('for');
photo_entry.childNodes[2].removeAttribute('name');
photo_entry.childNodes[2].removeAttribute('id');

// Convertir cada foto a drag'n drop
if (!navigator.platform.match(/iPhone|iPod|iPad/gm)){
  Sortable.create(photo_list, {
    animation: 150,
    delayOnTouchOnly: true,
    delay: 100,
    ghostClass: 'blue-background-class',
    filter: '.sort-ignore',
    onEnd: (e) => replace_order(e.target)
  });
}

// Devuelve la cantidad de inputs con información que hay en la lista
const list_lenght = () => {
  let counter = 0;
  const list = photo_list.childNodes;
  for (let i = 0; i < list.length; i++) {
    if (list[i].childNodes[2].files.length > 0) {
      counter++;
    }
  }
  return counter;
}

/** Crea un nuevo input con los parámetros necesarios
 * @param {string} value Valor a asignar a las entradas
 * @param {boolean} optional Si la entrada es opcional o no
 */
const create_input = (value, optional) => {
  let new_input = photo_entry.cloneNode(true);
      new_input.setAttribute('for', value);
      new_input.childNodes[2].setAttribute('name', value);
      new_input.childNodes[2].setAttribute('id', value);
  if (optional == true) { new_input.childNodes[2].classList.add('optional'); }

  return new_input;
}

// Añade un input vacío a la lista
function add_input(i) {
  const identifier = 'pet_photo_' + i;
    
  // Se crea un nuevo input vacío con parámetros opcionales
  // porque para este entonces el usuario ya seleccionó la
  // primera imágen que es la única obligatoria
  const new_input = create_input(identifier, true);

  // Se posiciona el elemento en la lista
  photo_list.appendChild(new_input);

  // Se actualizan los listeners para que todo siga funcionando
  refresh_fileinput_listener();
}

/** Añade una imagen a la lista mostrando su vista previa
 * @param {event} e Evento del elemento
 */
const add_image = function(e) {

  // Obtención de los archivos almacenados en el input
  let input_elem = e.target;
  let file = input_elem.files;

  // Si los hay...
  if (file.length > 0) {

    // Llamar FileReader
    let file_reader = new FileReader();
    file_reader.onload = function(event) {

      // Remueve el parámetro opcional de la entrada a la que se le asignó una foto
      input_elem.classList.remove('optional');

      // Deshabilita el input para que no se pueda usar otra vez
      input_elem.setAttribute('disabled', true);
      
      // Al cargarse se establece la vista previa en la imagen y se muestra
      let img_elem = e.target.previousSibling;
      img_elem.setAttribute('src', event.target.result);
      img_elem.classList.remove('hidden');
    }

    // Introducir el archivo
    file_reader.readAsDataURL(file[0]);
  }

  const ll = photo_list.childNodes.length;
  // En caso de que hayan menos de 5 imágenes...
  if (ll < 5) {
    // Añade un input
    add_input(ll);

  // Caso contrario...
  } else {

    // Actualiza la lista de inputs
    refresh_fileinput_listener();
  }

  input_elem.parentElement.classList.remove('sort-ignore');
}

// Muestra el botón para eliminar la imagen
const delete_image = (e) => {
  const elem = e.target;

  // Si aún no se desplegó el botón para borrar la imagen...
  if (elem.tagName == 'IMG') {

    // Mostrarlo
    const delete_button = elem.parentNode.childNodes[3].classList;
    delete_button.remove('hidden');
    

    // Ocultarlo a los 3 segundos
    setTimeout(function(){
      delete_button.add('hidden');
    }, 3000);


  // Si ya está desplegado...
  } else {
    let items = photo_list.childNodes;
    // Se obtiene el índice del item a borrar y se elimina
    for (let i = 0; i < items.length; i++) {
      if (items[i] == elem.parentNode) {

        // Borrar la imagen
        items[i].remove();

        const items_length = list_lenght();
        switch (items_length) {
          case 4:
            // En caso de que solo hayan 4 inputs con información añade uno vacío
            add_input(i);
            break;
          case 0:
            // En caso de que no haya ningun input con información le remueve el parámetro opcional
            items[0].childNodes[2].classList.remove('optional');
          default:
            break;
        }

        // Reordenar los indices
        replace_order(photo_list);

        // Actualizar los listeners
        refresh_fileinput_listener();
      }
    }
  }
}

// Añade un listener de cambio a cada input file
function fileinput_listener() {
  const list = photo_list.childNodes;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const item_input = item.childNodes[2];
    item.addEventListener('change', add_image);
    if(item_input.files.length > 0) {
      item.addEventListener('click', delete_image)
    }
  }
}

// Elimina los listeners de cambio de cada input file
function refresh_fileinput_listener() {
  const list = photo_list.childNodes;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const item_input = item.childNodes[2];
    item.removeEventListener('change', add_image);
    item.removeEventListener('click', delete_image);
    if(item_input.files.length > 0) {
      item.addEventListener('click', delete_image);
    } else {
      item.addEventListener('change', add_image);
    }
  }
}

/** Reordena las ID y los parámetros de los items de la lista de imágenes adecuandose al nuevo orden
 * @param {object} elem Elemento padre de la lista que se desea reordenar
 */
function replace_order(elem) {
  let items = elem.childNodes;
  for (let i = 0; i < items.length; i++) {
    const iteration = 'pet_photo_' + i;
    items[i].setAttribute('for', iteration);
    items[i].childNodes[2].setAttribute('name', iteration);
    items[i].childNodes[2].setAttribute('id', iteration);
  }
}

// Al cargar el documento se añade un listener a todos los inputs existentes
photo_list.onload = fileinput_listener();




// - - - - - - - - - - - - - - - - - - - - - - - -
// - SELECTS                                     -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Obtiene razas dependiendo el tipo de animal y las introduce en el select correspondiente
const create_list = async (type, dom, race) => {

  let list = document.getElementById(dom);

  try {

    let url = new URL(window.location.origin + '/api');
    if (type == 'animal') url.pathname += '/animals/get'; else url.pathname += '/races/get/' + race;

    // Petición de razas al servidor
    let request = await fetch(url);
    if (request.status >= 500) throw 'wtf are u doing reading this shit'; 
    request = await request.json();

    // Generador de items
    const item = (name, value) => {
      let elem = document.createElement("option");
      elem.innerHTML = (type == 'animal') ? lang.animals[name] : lang.races[race][name];
      elem.setAttribute("value", value || name);
      return elem;
    }
    
    // Remover los items anteriores
    while (list.childNodes.length > 1) list.removeChild(list.lastChild);

    // Añadir cada opción nueva
    for (let i = 0; i < request.length; i++) list.appendChild(item(request[i]));

  } catch(error) {
    switch(type) {
      case 'animal':
        alert.fatal({
          icon: 'icon-thumb-down',
          title: lang.clienterror.went_wrong,
          buttons: [
            { text: lang.retry, action: () => location.reload() },
            { text: lang.goback, action: () => window.history.back()}
          ]
        });
        break;
      default: alert.warn({msg: lang.clienterror.something_wrong}); break;
    }
  }
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

      // Escucha de un click en cada item
      c.addEventListener("click", async function(e) {

        // Cuando un item es clickeado se actualiza el select original y la opción seleccionada
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i; // Actualización del valor del select original

            // En caso de que el selector de animales cambie de valor...
            if (s.id == 'pet_animal') {

              // Obtención y posicionamiento de las razas en el select original
              await create_list('race', 'pet_race', s.value);

              // Reemplaza el select artificial del selector de razas por el nuevo
              let cs = document.getElementsByClassName('custom-races')[0];
              cs.childNodes[3].remove();
              cs.childNodes[2].remove();
              create_select('custom-races');

              // Evita que se reabran las opciones de los animales
              let ca = document.getElementsByClassName('custom-animals')[0];
              ca.childNodes[3].classList.toggle("select-hide");
              ca.childNodes[2].classList.toggle("select-arrow-active");
            }

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
    a.addEventListener("click", function(e) {
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
document.addEventListener("click", closeAllSelect);

// Crear los select personalizados al cargar el documento
window.addEventListener('load', async () => {
  await create_list('animal', 'pet_animal');
  create_select('custom-select');
  set_optionals();
});

// - - - - - - - - - - - - - - - - - - - - - - - -
// - ENVÍO DE LA INFORMACIÓN                     -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Obtención del boton de envio
const send_btn = document.getElementById('send_data');

// Envío de la información
send_btn.addEventListener('click', async () => {

  try {

    alert.info({
      data: lang.uploading,
      text: lang.adding_post,
      icon: 'icon-heart'
    });

    if (captcha_success == false) throw { name: 'InvalidCaptcha' };

    const json = await lib.getData('addpet');
    // console.log('JSON:', json);

    const data = await lib.parseJSON(json);
    // console.log('PARSED:', data);

    // let form_data_debug = {};
    // for (var entry of data.entries()) form_data_debug[entry[0]] = entry[1];
    // console.log('FORM DATA:', form_data_debug);
  
    const request = await fetch('/api/pets/add', {method: 'POST', body: data});
    const decoded = await request.json();

    // En caso de que la información necesaria esté presente...
    if (decoded.view_id != undefined && decoded.edit_id != undefined) {

      // Obtención del item "pet_posts" del localstorage
      var pets_posted = JSON.parse(localStorage.getItem('pet_posts'));
      
      // En caso de ser nulo o indefinido se genera un objeto
      if (pets_posted == undefined) pets_posted = {};
      
      // Guardado de las variables de la nueva mascota perdida
      pets_posted[decoded.view_id] = decoded.edit_id;
      
      // Guardado del objeto actualizado
      localStorage.setItem('pet_posts', JSON.stringify(pets_posted));
      
      // Página de publicación exitosa
      const url = new URL(`/pet/add/success/${decoded.view_id}`, window.location.origin);
      url.searchParams.append('pet_name', json.pet_name);
      url.searchParams.append('owner_email', json.owner_email)
      window.location.href = url.href;
    } else {
      throw decoded;
    }

  } catch(error) {
    alert.modal.destroy();
    alert.error({
      text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.clienterror.cant_get_info,
      title: lang.clienterror.something_wrong,
      icon: 'icon-thumb-down'
    });
  }
});

const dis_address = new autoComplete({ 
  selector: "#disappearance_place",
  threshold: 3,
  debounce: 450,
  data: { 
    src: async () => { 
      const query = document.getElementById("disappearance_place").value;

      // Peticiónado de datos a photon
      const photon_request = await fetch(`https://photon.komoot.io/api/?q=${query}&lat=-34.60367685025505&lon=-58.38159853604474&limit=5`);
      /** Decodificación de la respuesta de la petición}
       * @typedef {{coordinates: [number, number], type: 'Point'}} Geometry
       * @typedef {{ osm_id: number, osm_key: string, osm_type: string, osm_value: string, city: string, country: string, countrycode: string, county: string, district: string, name: string, postcode: string, state: string, type: string, housenumber: string, street: string, suburb: string }} Properties
       * @typedef {{ geometry: Geometry, properties: Properties, type: 'Feature' }} GeoJSON
       * @type {{features: Array.<GeoJSON>}}
       */
      let photon_features = await photon_request.json();

      // Por cada elemento dentro de features ...
      const features = photon_features.features.map(feature => {
        // Descomponemos el elemento en geometry y properties
        const { geometry, properties } = feature;
    
        /** Obtenemos la calle o el nombre de la caracteristica */ let title = [properties.street || properties.name];
        /** Si hay un numero de casa lo añadimos */ if (properties.housenumber != undefined) title.push(properties.housenumber);
    
        /** Unimos el titulo mediante espacios */ title = title.join(' ');
    
        /** @type {Array.<string>} Descripción de la caracteristica */ let description = [];
        /** Compobamos y añadimos el barrio o suburbio */ if (properties.suburb || properties.district) description.push(properties.suburb || properties.district);
        /** Compobamos y añadimos la ciudad */ if (properties.city) description.push(properties.city);
        /** Comprobamos el estado o el distrito */ if (properties.state || properties.state_district) description.push(properties.state || properties.state_district);
    
        /** Unimos todos los elementos de la descripción */ description = description.join(', ');
    
        /** Coordenadas de la caracteristica */ 
        const coordinates = [geometry.coordinates[1], geometry.coordinates[0]];
    
        /** Titulo compuesto (titulo, descripcion) */ const composed_title = [title, description].join(', ');
    
        return JSON.stringify({ title, description, composed_title, coordinates });
      });

      // const ds = ['{title: "uno"}', 'Dos', 'Tres'];

      // console.log(features);
      // console.log(ds);

      return features;
    },
    cache: false
  },
  noResults: (dataFeedback, generateList) => {
    // Generate autoComplete List
    generateList(dis_address, dataFeedback, dataFeedback.results);
    // No Results List Item
    const result = document.createElement("li");
    result.setAttribute("class", "no_result");
    result.setAttribute("tabindex", "1");
    result.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.5);">Found No Results for "${dataFeedback.query}"</span>`;
    document.querySelector(`#${dis_address.resultsList.idName}`).appendChild(result);
  },
  onSelection: (event) => {
    const selection = JSON.parse(event.selection.value);
    const elem = document.querySelector('#disappearance_place');

    elem.dataset.coordinates = selection.coordinates;

    document.querySelector('#disappearance_place').blur();
    document.querySelector("#disappearance_place").value = `${selection.title} ${selection.description}`;
  },
  resultItem: {                          // Rendered result item            | (Optional)
    content: (data, source) => {
      const decoded = JSON.parse(data.match);
      source.innerHTML = `<div><i class="icon-map-pin"></i>${decoded.title}</div><span>${decoded.description}</span>`;
    },
    element: "li"
  },
  searchEngine: (query, record) => { return record },
  highlight: true
});

const owner_address = new autoComplete({ 
  selector: "#owner_home",
  threshold: 3,
  debounce: 450,
  data: { 
    src: async () => { 
      const query = document.getElementById("owner_home").value;

      // Peticiónado de datos a photon
      const photon_request = await fetch(`https://photon.komoot.io/api/?q=${query}&lat=-34.60367685025505&lon=-58.38159853604474&limit=5`);
      /** Decodificación de la respuesta de la petición}
       * @typedef {{coordinates: [number, number], type: 'Point'}} Geometry
       * @typedef {{ osm_id: number, osm_key: string, osm_type: string, osm_value: string, city: string, country: string, countrycode: string, county: string, district: string, name: string, postcode: string, state: string, type: string, housenumber: string, street: string, suburb: string }} Properties
       * @typedef {{ geometry: Geometry, properties: Properties, type: 'Feature' }} GeoJSON
       * @type {{features: Array.<GeoJSON>}}
       */
      let photon_features = await photon_request.json();

      // Por cada elemento dentro de features ...
      const features = photon_features.features.map(feature => {
        // Descomponemos el elemento en geometry y properties
        const { geometry, properties } = feature;
    
        /** Obtenemos la calle o el nombre de la caracteristica */ let title = [properties.street || properties.name];
        /** Si hay un numero de casa lo añadimos */ if (properties.housenumber != undefined) title.push(properties.housenumber);
    
        /** Unimos el titulo mediante espacios */ title = title.join(' ');
    
        /** @type {Array.<string>} Descripción de la caracteristica */ let description = [];
        /** Compobamos y añadimos el barrio o suburbio */ if (properties.suburb || properties.district) description.push(properties.suburb || properties.district);
        /** Compobamos y añadimos la ciudad */ if (properties.city) description.push(properties.city);
        /** Comprobamos el estado o el distrito */ if (properties.state || properties.state_district) description.push(properties.state || properties.state_district);
    
        /** Unimos todos los elementos de la descripción */ description = description.join(', ');
    
        /** Coordenadas de la caracteristica */ 
        const coordinates = [geometry.coordinates[1], geometry.coordinates[0]];
    
        /** Titulo compuesto (titulo, descripcion) */ const composed_title = [title, description].join(', ');
    
        return JSON.stringify({ title, description, composed_title, coordinates });
      });

      // const ds = ['{title: "uno"}', 'Dos', 'Tres'];

      // console.log(features);
      // console.log(ds);

      return features;
    },
    cache: false
  },
  noResults: (dataFeedback, generateList) => {
    // Generate autoComplete List
    generateList(owner_address, dataFeedback, dataFeedback.results);
    // No Results List Item
    const result = document.createElement("li");
    result.setAttribute("class", "no_result");
    result.setAttribute("tabindex", "1");
    result.innerHTML = `<span style="display: flex; align-items: center; font-weight: 100; color: rgba(0,0,0,.5);">Found No Results for "${dataFeedback.query}"</span>`;
    document.querySelector(`#${owner_address.resultsList.idName}`).appendChild(result);
  },
  onSelection: (event) => {
    const selection = JSON.parse(event.selection.value);
    const elem = document.querySelector('#owner_home');

    elem.dataset.coordinates = selection.coordinates;

    document.querySelector('#owner_home').blur();
    document.querySelector("#owner_home").value = `${selection.title} ${selection.description}`;
  },
  resultItem: {                          // Rendered result item            | (Optional)
    content: (data, source) => {
      const decoded = JSON.parse(data.match);
      source.innerHTML = `<div><i class="icon-map-pin"></i>${decoded.title}</div><span>${decoded.description}</span>`;
    },
    element: "li"
  },
  searchEngine: (query, record) => { return record },
  highlight: true
});
