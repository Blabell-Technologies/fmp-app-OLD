import * as lib from '/scripts/lib.js';
import alert from '/lib/dist/alerts.class.js';
import { Compleshon } from '/lib/compleshon.class.js';
import { Select } from '/lib/select.class.js';



async function get_races(type, animal) {
  
  // Genera la URL
  const create_url = () => {
    let url = new URL(window.location.origin + '/api');
    if (type == 'animal') url.pathname += '/animals/get'; else url.pathname += '/races/get/' + animal;
    return url;
  }

  // Hace la petición
  const request = async (url) => {
    let request = await fetch(url);
    if (request.status >= 500) throw 'wtf are u doing reading this shit';
    request = await request.json();
    return request;
  }

  // Adapta la información al formato que los select necesitan
  const parse_data = (data, lang_path) => {
    let result = [];
    for (const item of data) {
      let parsed_item = { name: lang_path[item], value: item }
      result.push(parsed_item);
    }
    return result;
  }

  // Maneja el error si lo hay
  const handle_error = () => {
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

  // Ruta hasta las entradas del lenguaje necesarias dependiendo de si es un animal o una raza
  const lang_path = (type == 'animal') ? lang.animals : lang.races[animal];

  try {
    let url = create_url();
    let data = await request(url);
    data = parse_data(data, lang_path);
    return data;
  } catch (error) {
    handle_error()
  }
}


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
    console.log(pet_info);

    // Información ordenada adecuada a la creación de la página
    const ordered_info = skeleton(pet_info);

    // Añade de la información
    description(ordered_info);

    // Obtiene la lista de razas
    let races = await get_races('breed', pet_info.animal);
        races.unshift({ name: lang.prefer_not_to_say, value: 'unset' });
    new Select('#pet_race', {
      keyword: 'breed',
      default: pet_info.race || 'unset',
      title: lang.pet_race,
      options: races,
      pleaseSelectText: lang.prefer_not_to_say
    });

    let owner_home = ordered_info.general_information.owner_home;
    let owner_home_config = owner_home != undefined ? { 
      default: {
        coordinates: owner_home.coordinates[0] + ' ' + owner_home.coordinates[1],
        address: owner_home.address
      }
    } : {};

    new Compleshon('#owner_home', owner_home_config);

    let disappearance_place = ordered_info.general_information.disappearance_place;
    let disappearance_place_config = disappearance_place != undefined ? { 
      default: {
        coordinates: disappearance_place.coordinates[0] + ' ' + disappearance_place.coordinates[1],
        address: disappearance_place.address
      }
    } : {};
    new Compleshon('#disappearance_place', disappearance_place_config);

    // Añade detalles de los inputs
    set_optionals();

    // Obtiene los valores actuales para comparar
    default_values = lib.getData('editpet', true);

  } catch (error) {
    console.log(error);
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
        snd_btn.innerHTML = lang.edit_pet;
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

      lbl.classList.add('custom_select');

      // Crea un select
      let slct = document.createElement('select');
          slct.classList.add('optional', 'editpet');
          slct.value = value;
          slct.id = key;

      // Se junta todo en orden
      lbl.appendChild(slct);

      // Se devuelve
      return lbl;


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

window.onload = () => set_page();



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
          console.log(`${entry}: ${values[entry]}`);
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
        {text: lang.goback, type: 'primary', action: () => window.location.href = window.location.origin + '/pet/info/' + pet_info.id }
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