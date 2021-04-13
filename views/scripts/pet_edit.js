import * as lib from '/scripts/lib.js';
import alert from '/lib/dist/alerts.class.js';
// import { cmp } from 'geoip-lite';
// import { config } from 'node:process';




// - - - - - - - - - - - - - - - - - - - - - - - -
// - PETICIÓN Y MUESTRA DE LA INFORMACIÓN        -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Edit ID de la publicación
let pet_id = window.location.pathname.split('/');
    pet_id = pet_id[pet_id.length - 1];


// Variable global que contendrá la información de la mascota
let pet_info;

// Variable donde se almacenarán los valores predeterminados
let default_values;

// Esqueleto de la página
const skeleton = (data) => {
  return {
    cannotedit: {
      pet_name: data.pet_name,
      disappearance_date: data.disappearance_date,
      owner_name: data.owner_name,
      owner_email: data.owner_email
    },
    general_information: {
      pet_race: data.pet_race || '',
      disappearance_place: data.disappearance_place,
      details: data.details
    },
    contact: {
      owner_phone: data.owner_phone,
      owner_home: data.owner_home || ''
    },
    secondary: {
      reward: data.reward || ''
    }
  }
}

// Solicita los datos de la mascota
async function set_page() {

  try {
    
    // Petición y decodificación
    const request = await fetch(`/api/pets/post/${pet_id}`);
    const decoded = await request.json();

    if (decoded.name == 'ResourceNotFound') {
      alert.fatal({
        icon: 'icon-thumb-down',
        title: lang.clienterror.page_not_found,
      });
      return;
    }

    // Formato
    pet_info = format_api_data(decoded);

    // Información ordenada adecuada a la creación de la página
    const ordered_info = skeleton(pet_info);

    // Añade de la información
    description(ordered_info);

    // Obtiene la lista de razas
    await get_race();

    // Genera los selects personalizados
    create_select();

    // Añade detalles de los inputs
    set_optionals();
    
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
      resultItem: {                          
        content: (data, source) => {
          const decoded = JSON.parse(data.match);
          source.innerHTML = `<div><i class="icon-map-pin"></i>${decoded.title}</div><span>${decoded.description}</span>`;
        },
        element: "li"
      },
      searchEngine: (_query, record) => { return record },
      highlight: true
    });

    // Obtiene los valores actuales para comparar
    default_values = lib.getData('editpet', true);

  } catch (error) {
    // console.log(error);
    // En caso de error muestra un error fatal diciendo que hubo un error
    alert.fatal({
      icon: 'icon-thumb-down',
      title: lang.clienterror.went_wrong,
      buttons: [
        { text: lang.retry, action: () => window.location.reload() },
        { text: lang.goback, action: () => window.history.back() }
      ]
    });
  }
}

// Devuelve toda la información de la página
function description(obj) {

  // Contenedor
  let ctnr = document.createElement('div');
      ctnr.id = 'pet';

  // Para cada categoría...
  for (let cat in obj) {

    // Genera su objeto de configuracion
    let conf = {name: cat};

    // Le añade su id dependiendo de su nombre
    switch (cat) {
      case 'cannotedit':
        conf.id = 'cannotedit';
        break;
      case 'general_information':
        conf.id = 'generalinfo';
        break;
      case 'contact':
        conf.id = 'contactinfo';
        break;
      case 'secondary':
        conf.id = 'secondaryinfo';
        break;
      default:
        conf.id = undefined;
        break;
    }

    // Genera la categoría
    const elem = category(conf, obj[cat]);

    // La añade al contenedor
    ctnr.appendChild(elem);
  }

  // Genera el botón de envío
  const snd_btn = document.createElement('button');
        snd_btn.innerHTML = lang.send;
        snd_btn.addEventListener('click', () => send_data());

  // Lo añade
  ctnr.appendChild(snd_btn);

  // Añade todo el contenido al documento
  add_data(ctnr);
}

// Genera un div con información de cierta categoría
function category(conf, cat) {
  
  // Contenedor
  let ctnr = document.createElement('div');
      ctnr.id = conf.id;

  // Título
  let title = document.createElement('h3');
      title.innerHTML = lang[conf.name];

  // Se agrega primero el título
  ctnr.appendChild(title);

  // Para cada dato a mostrar dentro de la categoría...
  for (let line in cat) {

    // En caso de que dicho dato tenga valor...
    if (cat[line] != null) {

      let info = null;

      switch (conf.id) {
        case 'cannotedit':
          // Genera una linea de información
          info = category_info(line, cat[line], true);
          break;
        default:
          info = input_info(line, cat[line]);
          break;
      }

  
      // La añade al contenedor
      ctnr.appendChild(info);
    }
  }

  // Al finalizar devuelve el contenedor lleno
  return ctnr;
}

// Devuelve una linea de información
const category_info = (key, value, twoline = false) => {

  // Contenedor
  let ctnr = document.createElement('div');
      ctnr.classList.add(twoline ? 'twolines' : 'oneline', 'wantedpetinfo', (key == 'owner_email') ? 'nocap' : null);
  
  // Título
  let title = document.createElement('h4');
      title.innerHTML = lang[key];

  // Texto
  let text = document.createElement('p');
      text.innerHTML = value;

  // Unión
  ctnr.appendChild(title);
  ctnr.appendChild(text);

  // Retorno
  return ctnr;
}

// Devuelve una entrada de información
const input_info = (key, value) => {

  // Creación del label
  let lbl = document.createElement('label');
  lbl.setAttribute('for', key);
  // lbl.innerHTML = lang[key];

  // Creación del texto
  let span = document.createElement('span');
      span.innerHTML = lang[key];
  
  // Creación del input
  let inp = document.createElement('input');
      inp.setAttribute('type', 'text');
      inp.classList.add('editpet');
      inp.id = key;

  lbl.appendChild(span);

  // Dependiendo de que tipo de entrada sea...
  switch (key) {

    // Si es un lugar
    case 'owner_home':
      inp.classList.add('optional');
    case 'disappearance_place':

      inp.classList.add('address_input');

      // Crea el contenedor address de compleshon
      let cmp_a = document.createElement('div');
          cmp_a.classList.add('compleshon', 'compleshon-address');

      // Crea el contenedor de sugeridos de compleshon
      let cmp_s = document.createElement('div');
          cmp_s.classList.add('compleshon-suggestions');

      // El valor del input será la dirección y las coordenadas
      inp.value = value.address != undefined ? value.address : '';
      inp.dataset.coordinates = value.coordinates != undefined ? value.coordinates[0] + ', ' + value.coordinates[1] : '';

      // Se junta todo en orden
      lbl.appendChild(inp);
      cmp_a.appendChild(lbl);
      cmp_a.appendChild(cmp_s);

      // Se retorna
      return cmp_a;


    // Si es un selector de razas
    case 'pet_race':

      // Crea el contenedor custom
      let cstm = document.createElement('div');
          cstm.classList.add('custom-select', 'custom-races', 'optional');

      // Crea un select
      let slct = document.createElement('select');
          slct.classList.add('optional', 'editpet');
          slct.value = value;
          slct.id = key;

      // Se junta todo en orden
      cstm.appendChild(lbl);
      cstm.appendChild(slct);

      // Se devuelve
      return cstm;


    // Si es la recompensa
    case 'reward':

      // Añade que es opcional
      inp.classList.add('optional');

      // Junta las cosas y las devuelve
      inp.value = value;
      lbl.appendChild(inp);

      return lbl;

    // Si son los detalles
    case 'details':

      // Genera un textarea
      inp = document.createElement('textarea');
      inp.setAttribute('type', 'text');
      inp.classList.add('editpet');
      inp.id = key;
      inp.value = value;

      // Lo junta y lo devuelve
      lbl.appendChild(inp);
      return lbl;


    // En caso de que sea cualquier otro
    default:

      // Simplemente junta las cosas y las devuelve
      inp.value = value;
      lbl.appendChild(inp);

      return lbl;
  }
}

// Añade elementos al documento
function add_data(elem) {
  const footer = document.getElementsByTagName('footer')[0];
  footer.parentNode.insertBefore(elem, footer);
}

// Obtiene la lista de razas
const get_race = async () => {

  const races = document.getElementById('pet_race');
  
  try {

    // Petición de razas al servidor
    let request = await fetch(`/api/races/get/${pet_info.animal}`);
    request = await request.json();
    request = format_api_data(request);

    // console.log('RACES:', request);

    // Eliminar todos las opciones actuales
    while (races.firstChild) {races.firstChild.remove();};
    
    const item = (name, value) => {
      let elem = document.createElement("option");
          elem.innerHTML = name;
          elem.setAttribute("value", value != undefined ? value : name);
      return elem;
    }
  
    // Si la raza está especificada desde antes la añade como seleccionada
    if (pet_info.pet_race == null) { races.append(item(lang.select, 'none')); } 
    else { races.append(item(lang.races[pet_info.animal][pet_info.race])); }
    for (let i = 0; i < request.length - 1; i++) races.append(item(lang.races[pet_info.animal][request[i]]));
  } catch(error) {
    // console.log(error);
    alert.fatal({
      icon: 'icon-thumb-down',
      title: lang.clienterror.cant_get_info
    });
  }
}


window.onload = () => set_page();


// - - - - - - - - - - - - - - - - - - - - - - - -
// - SELECTS PERSONALIZADOS                      -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Crea selects personalizados
function create_select() {
    var x, i, j, l, ll, selElmnt, a, b, c;
    /* Look for any elements with the class "custom-select": */
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
      selElmnt = x[i].getElementsByTagName("select")[0];
      ll = selElmnt.length;
      /* For each element, create a new DIV that will act as the selected item: */
      a = document.createElement("DIV");
      a.setAttribute("class", "select-selected");
      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
      x[i].appendChild(a);
      /* For each element, create a new DIV that will contain the option list: */
      b = document.createElement("DIV");
      b.setAttribute("class", "select-items select-hide");
      for (j = 1; j < ll; j++) {
        /* For each option in the original select element,
        create a new DIV that will act as an option item: */
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function() {
            /* When an item is clicked, update the original select box,
            and the selected item: */
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
              if (s.options[i].innerHTML == this.innerHTML) {
                s.selectedIndex = i;
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
        /* When the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      });
    }
}


// Cierra todos los selects cuando sea necesario
function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
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


// Cierra los select cuando se haga click en algún lado del documento
document.addEventListener("click", closeAllSelect);

// - - - - - - - - - - - - - - - - - - - - - - - -
// - ENVÍO DE LA INFORMACIÓN                     -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Envío de datos
async function send_data() {

  alert.info({
    title: lang.uploading,
    text: lang.modify_info,
    icon: 'icon-heart'
  });

  let values;
  let form_data;

  // Obtención de datos al momento del envío
  try {

    values = lib.getData('editpet');
    form_data = new FormData();
  
    // Para cada entrada en default...
    for (let entry in default_values) {
  
        // Se comprueba que haya una igual en values
        if (entry in values) {
  
          // En ese caso, se observa si el valor por defecto y el actual son diferentes. Al ser así se añade al form data
          if (default_values[entry] != values[entry]) form_data.append(entry, values[entry]);
          // console.log(`${entry}: ${values[entry]}`);
        // En caso de que no haya una entrada igual en values...
        } else {
  
          // En caso de que value[entry] sea indefinido y su valor correspondiente en default sea distinto a '', se añade al form data
          if (values[entry] == undefined && default_values[entry] != '') form_data.append(entry, 'unset');
        }
    }

  } catch(error) {
    alert.modal.destroy();
    alert.error({
      title: lang.clienterror.empty_data,
      icon: 'icon-thumb-down',
      buttons: [
        {text: lang.retry, type: 'primary', action: () => send_data()}
      ]
    });
    return;
  }

  try {
    const request = await fetch(`/api/pets/modify/${pet_id}`, {method: 'PUT', body: form_data});
    const decoded = await request.json();

    // Comprueba que lo devuelto por el servidor no sea un código de error
    if (decoded.name != undefined && decoded.message != undefined) throw decoded;
    
    default_values = lib.getData('editpet', true);

    alert.modal.destroy();
    alert.info({
      title: lang.modify_success,
      icon: 'icon-heart',
      buttons: [
        {text: lang.goback, type: 'primary', action: () => window.location.href = `https://foundmypet.org/pet/info/${pet_info.id}`}
      ]
    });

  } catch(error) {
    alert.modal.destroy();
    alert.error({
      title: lang.modify_error,
      icon: 'icon-thumb-down',
      text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.clienterror.something_wrong,
      buttons: [
        {text: lang.retry, type: 'primary', action: () => send_data()}
      ]
    });
  }
}