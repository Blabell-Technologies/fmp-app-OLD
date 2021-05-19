import * as lib from '/scripts/lib.js';
import alert from '/lib/dist/alerts.class.js';
import { Select } from '/lib/select.class.js';
import { PictureList } from '/lib/picturelist.class.js';
import { Compleshon } from '/lib/compleshon.class.js';



// - - - - - - - - - - - - - - - - - - - - - - - -
// - ENVÍO DE LA INFORMACIÓN                     -
// - - - - - - - - - - - - - - - - - - - - - - - -

async function send_data() {

  // Obtiene la información
  const get_info = async () => {
    let data = await lib.getData('addpet');
        data = await lib.parseJSON(data);
    return data;
  }

  // Envía la información
  const send_info = async (data) => {
    const request = await fetch('/api/pets/add', {method: 'POST', body: data});
    const decoded = await request.json();

    if (decoded.view_id == undefined && decoded.edit_id == undefined) throw decoded;
    return decoded;
  }

  // Añade datos al localstorage
  const add_to_local_storage = (data) => {
    let pets_posted = JSON.parse(localStorage.getItem('pet_posts'));
    if (pets_posted == undefined) pets_posted = {};
    pets_posted[data.view_id] = data.edit_id;
    localStorage.setItem('pet_posts', JSON.stringify(pets_posted));
  }

  // Maneja el error si lo hay
  const handle_error = (error) => {
    alert.modal.destroy();
    alert.error({
      text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.clienterror.cant_get_info,
      title: lang.clienterror.something_wrong,
      icon: 'icon-thumb-down'
    });
  }

  try {
    alert.info({
      data: lang.uploading,
      text: lang.adding_post,
      icon: 'icon-heart'
    });

    if (captcha_success == false) throw { name: 'InvalidCaptcha' };

    let data = await get_info();
    let response = await send_info(data);
    add_to_local_storage(response);

  } catch (err) {
    handle_error(err);
  }
}



// - - - - - - - - - - - - - - - - - - - - - - - -
// - SELECTS                                     -
// - - - - - - - - - - - - - - - - - - - - - - - -

// Genera los select de animales y raza con toda
// la funcionalidad y relación que tiene que haber
// entre ellos
class Selects {

  constructor() {
    this.animal_select;
    this.breed_select;

    this.#create_animal_select();
    this.#create_breed_select();
  }

  /** Solicita la información de animales y razas al servidor
   * @param {'animal'|'breed'} type - Tipo de dato que se desea solicitar
   * @param {string} animal - Animal del que se quieren obtener las razas
   * @returns Un objeto ordenado y con el formato necesario para los select
   */
  async #request_data(type, animal) {

    // Genera la URL
    function create_url() {
      let url = new URL(window.location.origin + '/api');
      if (type == 'animal') url.pathname += '/animals/get'; else url.pathname += '/races/get/' + animal;
      return url;
    }

    // Hace la petición
    async function request(url) {
      let request = await fetch(url);
      if (request.status >= 500) throw 'wtf are u doing reading this shit';
      request = await request.json();
      return request;
    }

    // Adapta la información al formato que los select necesitan
    function parse_data(data, lang_path) {
      let result = [];
      for (const item of data) {
        let parsed_item = { name: lang_path[item], value: item }
        result.push(parsed_item);
      }
      return result;
    }

    // Maneja el error si lo hay
    function handle_error() {
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

  /** Genera el select de animales y su relación con el de razas
   */
  async #create_animal_select() {

    // Modifica las razas disponibles dependiendo del animal seleccionado
    const change_breed_options = async (animal) => {
      let options = await this.#request_data('breed', animal);
      this.breed_select.setOptions = options;
      this.breed_select.lock = false;
    }

    let options = await this.#request_data('animal');
    this.animal_select = new Select('#pet_animal', {
      options,
      title: lang.animal,
      keyword: 'animal',
      pleaseSelectText: lang.select,
      onValueChange: async function(value) {
        await change_breed_options(value);
      }
    });
  }

  /** Genera el select de razas
   */
  #create_breed_select() {
    this.breed_select = new Select('#pet_race', {
      options: [],
      title: lang.pet_race,
      keyword: 'breed',
      locked: true,
      pleaseSelectText: lang.select,
      onClickWhenLocked: function() {
        alert.warn({msg: lang.clienterror.something_wrong});
      }
    });
  }

}



window.addEventListener('load', async () => {
  set_optionals();
  new Selects();
  new PictureList('#photo_list', { keyword: 'pet_photo_' });
  new Compleshon('#disappearance_place');
  new Compleshon('#owner_home');

  document.getElementById('send_data').addEventListener('click', send_data);
});