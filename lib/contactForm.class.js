/**
 * @file Crea y administra formularios de contacto (teléfono y red social)
 * @author Bruno Emanuel Ferreyra <brunoemanuelferreyra@gmail.com>
 */


/** Callback al crear un input
 * 
 * @callback onInputCreated
 * @param {string} id - Identificador del nuevo input
 */
/** Callback al remover un input
 * 
 * @callback onInputRemoved
 * @param {string} id - Identificador del input removido
 */
/** Callback al modificar un input
 * 
 * @callback onInputChange
 * @param {string} value - Valor
 * @param {string} id - Identificador del input
 */
/** Callback al intentar crear un input habiendo alcanzado el límite
 * 
 * @callback onCreateWhenLimitReached
 * @param {string} id - Identificador del input que no se pudo crear
 */
/** Callback al terminar de crear el formulario
 * 
 * @callback onCreated
 * @param {Object} class - Clase del formulario
 */

/** Objeto de configuración para crear un input
 * @typedef {Object} Input
 * 
 * @property {string} [keyword] - Palabra clave que identifica al formulario
 * @property {number} [key] - Número identificador de la palabra clave
 * @property {string} [type] - Tipo de input (text, tel, password, etc)
 * @property {'img'|'span'} [icon_type] - Elemento para el ícono del select
 * @property {string} [title] - Título del input visible por el usuario
 * @property {string} [class] - Clase a añadir al input
 * @property {boolean} [optional] - Determina si el input es opcional y se lo muestra al usuario
 * @property {Object} select_config - Configuración del select
 * @property {string} [default] - Valor por defecto
 * 
 * @property {onInputRemoved} [callback_on_quit] - Callback al remover un input
 * @property {onInputChange} [callback_on_change] - Callback al modificar un input
 */
/** Objeto de configuración para crear el formulario
 * @typedef {Object} ContactFormConfig
 * 
 * @property {string} [keyword] - Palabra clave que identifica al formulario
 * @property {Object} [inputs] - Configuración de los inputs
 * @property {number} [inputs.limit] - Límite total de inputs en el formulario
 * @property {Object} [inputs.phone] - Configuración de los input tipo teléfono
 * @property {number} [inputs.phone.limit] - Límite de inputs tipo teléfono
 * @property {Array} [inputs.phone.default] - Listado de teléfonos por defecto
 * @property {Object} [inputs.social] - Configuración de los input tipo red social
 * @property {number} [inputs.social.limit] - Límite de inputs tipo red social
 * @property {Array} [inputs.social.default] - Listado de redes sociales por defecto
 * 
 * @property {onInputCreated} [onInputCreated] - Callback al crear un input
 * @property {onInputRemoved} [onInputRemoved] - Callback al remover un input
 * @property {onInputChange} [onInputChange] - Callback al modificar un input
 * @property {onCreateWhenLimitReached} [onCreateWhenLimitReached] - Callback al intentar crear un input habiendo alcanzado el límite
 * @property {onCreated} [onCreated] - Callback al terminar de crear el formulario
 */


import { Select } from '/lib/select.class.js';

/** Input básico de contacto
 * @class
 */
class ContactInput {

  /**
   * @param {Input} config - Configuración del input
   */
  constructor(config = {}) {
    this.keyword = config.keyword || 'input';
    this.keynum = new Number(config.key) || 0;
    this.key = this.keyword + '_' + this.keynum;
    this.type = config.type || 'text';
    this.icon_type = config.icon_type || 'span';
    this.title = config.title || 'Contacto';
    this.class = config.class || 'custominput';
    this.optional = config.optional || false;
    this.select_config = config.select_config || {};
    this.default = config.default || '';
    
    this.select;
    this.input;
    this.dom;

    this.callback_on_quit = config.callback_on_quit || null;
    this.callback_on_change = config.callback_on_change || null;
  }

  build() {

    // Genera el selector de los input
    const left_selector = () => {

      // Selector interactivo
      const select = () => {

        let selector = document.createElement('select');
            selector.name = 'select-' + this.key;

        if (this.callback_on_change != null) {
          this.select_config.onValueChange = () => {
            this.callback_on_change(this);
          }
        }

        this.select = new Select(selector, this.select_config);

        return selector;
      }

      // Muestra del país seleccionado
      const show = () => {
        let selected_data = document.createElement('div');
        let selected_icon = document.createElement(this.icon_type);
        let selected_title = document.createElement('span');

        selected_data.appendChild(selected_icon);
        selected_data.appendChild(selected_title);

        return selected_data;
      }

      let selector = document.createElement('div');
          selector.classList.add('selector');
      const type_select = select();
      const selected_data = show();
      selector.appendChild(type_select);
      selector.appendChild(selected_data);

      return selector;
    }

    // Genera el input
    const input_dom = () => {
      let input = document.createElement('input');
          input.classList.add(this.class);
          input.type = this.type;
          input.name = this.key;
      if (this.default != undefined) input.value = this.default;
      if (this.callback_on_change != null) {
        input.addEventListener('input', () => {
          this.callback_on_change(this);
        });
      }

      this.input = input;
      return this.input;
    }

    // Genera el botón para remover el input
    const quit_button = () => {
      let quit = document.createElement('span');
          quit.textContent = 'X';
          quit.addEventListener('click', () => this.quit());

      return quit;
    }

    // Une todo formando el input personalizado
    const create_input = () => {
      let custom_input = document.createElement('div');
          custom_input.classList.add(this.type + '_input');

      const select = left_selector();
      const input = input_dom();
      const quit = quit_button();

      custom_input.appendChild(select);
      custom_input.appendChild(input);
      custom_input.appendChild(quit);

      return custom_input;
    }


    let label = document.createElement('label');
        label.setAttribute('for', this.key);
        label.classList.add('custom_input');

    let title = document.createElement('span');
        title.textContent = `${this.keynum + 1}° ${this.title}`;
    if (this.optional) title.dataset.opt_text = 'Dato opcional';

    const input = create_input();

    label.appendChild(title);
    label.appendChild(input);

    this.dom = label;
    return label;
  }

  //#region Controles

  /** Remueve el input
   */
  quit() {
    if (this.callback_on_quit != null) this.callback_on_quit(this);
    this.dom.remove();
  }

  //#endregion

  //#region Getters

  /** Retorna el valor del select elegido
   */
  get select_value() {
    return (this.select == undefined) ? this.select_config.default : this.select.selectedOption;
  }

  /** Devuelve el valor del input
   */
  get value() {
    return this.input.value;
  }
  
  /** Devuelve el número de key
   */
  get keynumber() {
    return this.dom.getAttribute('for').split('_')[1];
  }

  /** Devuelve el DOM del input
   */
  get dom_element() {
    return this.dom;
  }

  //#endregion

  //#region Setters

  /** Asigna un valor al input
   * @param {string} value - Valor
   */
  set value(value) {
    this.input.value = value;
  }

  /** Asigna un valor al select del input
   * @param {string} value - Valor
   */
  set select_value(value) {
    this.select.select(value);
  }

  /** Establece una nueva key para el input
   * @param {number} key - Número de id
   */
  set new_key(key) {
    this.keynum = new Number(key);
    this.key = this.keyword + '_' + this.keynum;
    this.dom.setAttribute('for', this.key);
    this.dom.querySelector('select').setAttribute('name', 'select-' + this.key);
    this.dom.querySelector('input').setAttribute('name', this.key);
    this.dom.firstChild.textContent = `${this.keynum + 1}° ${this.title}`;
  }

  /** Establece un ícono de opción seleccionada
   * @param {string} ref - Referencia al ícono
   */
  set icon(ref) {
    let icon = this.dom.querySelector('div.selector > div').firstElementChild;
    switch (icon.tagName) {
      case 'IMG': icon.src = ref; break;
      case 'SPAN': icon.classList = ''; icon.classList.add(ref); break;
      default: break;
    }
  }

  /** Establece un texto de opción seleccionada
   * @param {string} val - Texto
   */
  set span(val) {
    let span = this.dom.querySelector('div.selector > div').lastElementChild;
        span.textContent = val;
  }

  //#endregion

}


/** Input de tipo teléfono
 * @class
 */
class Phone extends ContactInput {

  /**
   * @param {'string'|'HTMLElement'} target - Elemento DOM sobre el cual colocar el input
   * @param {Input} config - Configuración adicional
   */
  constructor(target, config = {}) {
    super({
      keyword: config.keyword,
      key: config.key,
      type: 'tel',
      icon_type: 'img',
      title: config.title,
      class: config.class,
      optional: config.optional,
      callback_on_quit: config.callback_on_quit,
      callback_on_change: config.callback_on_change,
      select_config: config.select_config,
      default: config.default
    });
    this.target = typeof(target) == 'string' ? document.querySelector(target) : target;
    this.dom = super.build();
    this.set_selection(super.select_value);
    this.target.appendChild(this.dom);
  }

  //#region Controles

  /** Selecciona un país
   * @param {string} value - Valor
   */
  set_selection(value) {
    if (super.dom_element) {
      value = libphonenumber.parsePhoneNumber(`${value}1111111111`);
      super.icon = `https://www.countryflags.io/${value.country}/flat/24.png`;
      super.span = `+${value.countryCallingCode}`;
    }
  }

  //#endregion

  //#region Getters

  /** Devuelve el valor
   */
  get value() {
    return `${this.select_value}${super.value}`;
  }

  /** Devuelve el valor del select
   */
  get select_value() {
    return super.select_value;
  }

  /** Devuelve el elemento DOM
   */
  get element() {
    return this.dom;
  }

  /** Retorna el número
   */
  get keynumber() {
    return super.keynumber;
  }

  /** Devuelve el identificador
   */
  get id() {
    return this.dom.getAttribute('for');
  }

  //#endregion

  //#region Setters

  /** Establece un nuevo valor del input
   * @param {string} value - Valor
   */
  set value(value) {
    super.value = value;
  }

  /** Establece un nuevo valor del selecct
   * @param {string} value - Valor
   */
  set select_value(value) {
    super.select_value = value;
  }

  //#endregion

}


/** Input de tipo red social
 * @class
 */
class SocialMedia extends ContactInput {

  /**
   * @param {'string'|'HTMLElement'} target - Elemento DOM sobre el cual colocar el input
   * @param {Input} config - Configuración adicional
   */
  constructor(target, config = {}) {
    super({
      keyword: config.keyword,
      key: config.key,
      type: 'text',
      icon_type: 'span',
      title: config.title,
      class: config.class,
      optional: config.optional,
      callback_on_quit: config.callback_on_quit,
      callback_on_change: config.callback_on_change,
      select_config: config.select_config,
      default: config.default
    });
    this.target = typeof(target) == 'string' ? document.querySelector(target) : target;
    this.dom = super.build();
    this.set_selection(super.select_value);
    this.target.appendChild(this.dom);
  }

  //#region Controles

  /** Selecciona un país
   * @param {string} value - Valor
   */
  set_selection(value) {
    if (super.dom_element) {
      super.icon = 'icon-' + value;
    }
  }

  //#endregion

  //#region Getters

  /** Devuelve el valor
   */
    get value() {
    return `${this.select_value}:${super.value}`;
  }

  /** Devuelve el valor del select
   */
  get select_value() {
    return super.select_value;
  }

  /** Devuelve el elemento DOM
   */
  get element() {
    return this.dom;
  }

  /** Retorna el número
   */
  get keynumber() {
    return super.keynumber;
  }

  /** Devuelve el identificador
   */
  get id() {
    return this.dom.getAttribute('for');
  }

  //#endregion

  //#region Setters

  /** Establece un nuevo valor del input
   * @param {string} value - Valor
   */
    set value(value) {
    super.value = value;
  }

  /** Establece un nuevo valor del selecct
   * @param {string} value - Valor
   */
  set select_value(value) {
    super.select_value = value;
  }

  //#endregion

}


/** Formulario de contacto (teléfono o redes sociales)
 * @class
*/
class ContactForm {

  /**
   * @param {'string'|'HTMLElement'} target - Elemento DOM sobre el cual colocar el formulario
   * @param {ContactFormConfig} config - Configuración adicional
   */
  constructor(target, config = { inputs: {} }) {
    this.target = typeof(target) == 'string' ? document.querySelector(target) : target;
    this.keyword = config.keyword || 'contact';
    this.limit = config.inputs.limit || Number.MAX_SAFE_INTEGER;
    delete config.inputs.limit;
    this.default = config.inputs || {
      phone: { default: {}, limit: 3 },
      social: { default: {}, limit: 0 }
    }

    this.dom;
    this.inputs_container;
    this.countries;
    this.socialmedia;
    this.inputs = {
      phone: { default: {}, result: {}, class: {} },
      social: { default: {}, result: {}, class: {} }
    };

    this.callback_on_input_created = config.onInputCreated || null;
    this.callback_on_input_removed = config.onInputRemoved || null;
    this.callback_on_input_change = config.onInputChange || null;
    this.callback_on_created = config.onCreated || null;
    this.callback_on_create_when_limit_reached = config.onCreateWhenLimitReached || null;

    this.logprefix = `[${this.keyword.toUpperCase()} FORM]`;

    if (!this.target) {
      console.error(this.logprefix, 'Target selector or dom is undefined');
      return;
    }

    const phonelimit = (this.default.phone) ? this.default.phone.limit || 3 : 3;
    const sociallimit = (this.default.social) ? this.default.social.limit || 0 : 0;
    if (phonelimit + sociallimit > this.limit) {
      console.warn(this.logprefix, 'Composed limit is greater than total limit');
    }

    this.build();
  }

  async build() {

    // Listado de redes sociales
    const social_media = [
      { name: 'Facebook', value: 'facebook' },
      { name: 'Instagram', value: 'instagram' },
      { name: 'Twitter', value: 'twitter' }
    ];

    // Obtiene la lista de países con su código de teléfono
    const country_list = async () => {
      let options = [];

      let countries = await fetch('https://restcountries.eu/rest/v2/all');
          countries = await countries.json();

      for (const country of countries) {
        let { name, alpha2Code, callingCodes, translations, region, subregion } = country;
        translations.en = name;

        if (region == 'Americas' && subregion == 'South America') {
          const value = `+${callingCodes[0]}`;
          options.push({ name: translations.es || name, value });
        }
      }

      return options;
    }

    // Crea los botones para generar nuevos inputs
    const create_add_buttons = () => {

      // Nueva red social
      const social_button = () => {
        let button = document.createElement('span');
            button.textContent = lang.add_social;
            button.classList.add('add_social');
            button.addEventListener('click', () => this.create_input('social'));
        return button;
      }

      // Nuevo teléfono
      const phone_button = () => {
        let button = document.createElement('span');
            button.textContent = lang.add_phone;
            button.classList.add('add_phone');
            button.addEventListener('click', () => this.create_input('phone'));
        return button;
      }


      let buttons = document.createElement('div');
      const social_limit = this.default.social != undefined ? this.default.social.limit : 0;
      const phone_limit = this.default.phone != undefined ? this.default.phone.limit : 0;
      if (social_limit > 0) buttons.appendChild(social_button());
      if (phone_limit > 0) buttons.appendChild(phone_button());
      return buttons;
    }

    // Genera el contenedor de la lista de contacto
    const create_container = () => {
      this.dom = document.createElement('div');
      this.dom.classList.add('contact-methods');
      this.inputs_container = document.createElement('div');
      let buttons_container = create_add_buttons();
      this.dom.appendChild(this.inputs_container);
      this.dom.appendChild(buttons_container);
      return this.dom;
    }

    // Establece los valores por defecto indicados en el constructor
    const set_defaults = () => {

      // Añade el valor del nuevo input a las listas
      const push_to_list = (type, input, key) => {
        this.inputs[type].result[key] = input_value;
        this.inputs[type].default[key] = input_value;
      }

      // Adapta el valor original al necesario para crear un input de teléfono
      const phone_params = (value) => {
        try {
          value = libphonenumber.parsePhoneNumber(value);
          select_value = `+${value.countryCallingCode}`;
          input_value = value.nationalNumber;
          return { select_value, input_value };
        } catch (phone_error) {
          throw `Default inputs: string on phone is not a phone`;
        }
      }

      // Adapta el valor original al necesario para crear un input de red social
      const social_params = (value) => {
        try {
          value = value.split(':');
          if (value[1] == undefined) throw value;
          select_value = value[0];
          input_value = value[1];
          return { select_value, input_value };
        } catch (social_error) {
          throw `Default inputs: string on social is bad formatted or is not social media`
        }  
      }

      let counter = 0;

      // Recorre cada categoría
      for (let type in this.default) {
        const config_input = this.default[type];
        if (config_input.default != undefined || Array.isArray(config_input.default)) {
          let type_counter = 0;
          for (const item in config_input.default) {
            try {
              var select_value, input_value;
              let value = config_input.default[item];
              if (type_counter > config_input.limit) throw `Default inputs: limit of ${type} exceeded`;
              if (counter > this.limit) throw `Default inputs: total limit exceeded`;
              
              switch (type) {
                case 'phone': var { select_value, input_value } = phone_params(value); break;
                case 'social': var { select_value, input_value } = social_params(value); break;
                default: throw `Default inputs: cannot create input ${type}[${item}] because type ${type} is unknown`;
              }
  
              const input = this.create_input(type, select_value, input_value, item);
              if (input != undefined) push_to_list(type, input, item);
              type_counter++;
              counter++;
  
            } catch (error) {
              console.warn(this.logprefix, error);
              return;
            }
          }
        } else {
          if (this.inputlist.length == 0) this.create_input(type, '+54', '');
        }
      }
    }

    try {
      this.countries = await country_list();
      this.socialmedia = social_media;

      let container = create_container();
      this.target.appendChild(container);
      set_defaults();
      if (this.callback_on_created != null) this.callback_on_created(this);
    } catch (error) {
      console.error(this.logprefix, error);
    }
  }

  //#region Controles

  /** Genera un nuevo input
   * @param {'phone'|'social'} type - Tipo de input
   * @param {string} key - Valor que adquirirá el select del input
   * @param {string} value - Valor que adquirirá el input como tal
   */
  create_input(type, key, value, id) {

    // Configura y añade un input para teléfono
    const add_phone = (config, key, value) => {
      config.title = lang.owner_phone;
      config.class = 'phone_contact';
      config.select_config = {
        options: this.countries,
        default: key || '+54',
        title: lang.owner_phone,
        keyword
      }
      let phone = new Phone(this.inputs_container, config);
      return phone;
    }

    // Configura y añade un input para red social
    const add_social = (config, key, value) => {
      config.title = lang.owner_socialmedia;
      config.class = 'social_contact';
      config.select_config = {
        options: this.socialmedia,
        default: key || this.socialmedia[Math.floor(Math.random() * (this.socialmedia.length - 0) + 0)].value,
        title: lang.owner_socialmedia,
        keyword
      }
      let social = new SocialMedia(this.inputs_container, config);
      return social;
    }
    
    // Callback al intentar remover un input
    const on_quit = (input, id) => {
      delete this.inputs[type].class[id];
      delete this.inputs[type].result[id];
      if (this.callback_on_input_removed) this.callback_on_input_removed(input.id);
      this.reassign_keys(type);
      this.unlock_button(type);
    }

    // Callback al modificar el valor de un input
    const on_change = (input, id) => {
      if (input.element) {
        input.set_selection(input.select_value);
        this.inputs[type].result[id] = input.value;
        if (this.callback_on_input_change) this.callback_on_input_change(input.value, input.id);
      }
    }


    const keynumber = this.object_length(this.inputs[type].class);
    id = (id != undefined) ? id : `new_${keynumber}`;
    const keyword = type;
    let input_class;

    if (keynumber >= this.default[type].limit || this.inputlist.length >= this.limit) {
      if (this.callback_on_create_when_limit_reached != null) {
        this.callback_on_create_when_limit_reached(`${type}_${keynumber}`);
      }
      return;
    }

    let config = {};
    config.default = value;
    config.key = keynumber;
    config.keyword = type;
    config.callback_on_quit = (input) => on_quit(input, id);
    config.callback_on_change = (evt) => on_change(evt, id);

    switch (type) {
      case 'phone': input_class = add_phone(config, key, value); break;
      case 'social': input_class = add_social(config, key, value); break;
      default: break;
    }

    this.inputs[type].class[id] = input_class;
    if (this.callback_on_input_created != null) this.callback_on_input_created(input_class.id);
    if (keynumber + 1 >= this.default[type].limit) this.block_button(type);
    return input_class;
  }
  

  /** Reasigna las keys de un grupo de tipos de input
   * @param {'phone'|'social'} type - Tipo de input sobre el que reasignar las id
   */
  reassign_keys(type) {
    let counter = 0;
    for (let item in this.inputs[type].class) {
      this.inputs[type].class[item].new_key = counter;
      counter++;
    }
  }


  /** Bloquea un botón de añadir
   * @param {string} type - Tipo de select al que está orientado el botón a bloquear
   */
  block_button(type) {
    let button = this.dom.querySelector(`span.add_${type}`);
        button.classList.add('blocked');
  }


  /** Desbloquea un botón de añadir
   * @param {string} type - Tipo de select al que está orientado el botón a desbloquear
   */
  unlock_button(type) {
    let button = this.dom.querySelector(`span.add_${type}`);
        button.classList.remove('blocked');
  }


  /** Devuelve el tamaño de un objeto dado
   */
  object_length(obj) {
    let size = 0;
    for (const key in obj) if (obj.hasOwnProperty(key)) size++;
    return size;
  }

  //#endregion

  //#region Getters

  /** Obtiene el valor total de todo el formulario
   */
  get value() {
    let unset = [], add = [], replace = {};
    
    // Recorre categorías (red social o teléfono)
    for (const type in this.inputs) {
      const result_list = this.inputs[type].result;
      const default_list = this.inputs[type].default;
      const merge = {...result_list, ...default_list};

      // Recorre los valores de cada categoría
      for (let item in merge) {
        const input_value = result_list[item];
        const input_default = default_list[item];
        const is_result = result_list.hasOwnProperty(item);
        const is_default = default_list.hasOwnProperty(item);
        
        // En caso de que no coincidan entre si, determina a que categoría añadirlo
        if (!is_result && is_default) unset.push(item);
        if ((is_result && is_default) && input_value != input_default) replace[item] = input_value;
        if (is_result && !is_default) add.push(input_value);
      }
    }
    return {unset, replace, add};
  }


  /** Devuelve un listado DOM de los inputs existentes
   */
  get inputlist() {
    return this.dom.firstChild.childNodes;
  }

  //#endregion

  //#region Setters

  /** Callback al crear un input
   */
  set onInputCreated(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_input_created = callback;
    } else {
      console.error(`${this.logprefix} Error setting onInputCreated callback => the argument is not a function`);
    }
  }


  /** Callback al quitar un input
   */
  set onInputRemoved(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_input_removed = callback;
    } else {
      console.error(`${this.logprefix} Error setting onInputRemoved callback => the argument is not a function`);
    }
  }


  /** Callback al cambiar un input
   */
  set onInputChange(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_input_change = callback;
    } else {
      console.error(`${this.logprefix} Error setting onInputChange callback => the argument is not a function`);
    }
  }


  /** Callback al intentar crear un input habiendo llegado al límite
   */
  set onCreateWhenLimitReached(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_create_when_limit_reached = callback;
    } else {
      console.error(`${this.logprefix} Error setting onCreateWhenLimitReached callback => the argument is not a function`);
    }
  }


  /** Callback al terminar de crear el formulario
   */
  set onCreated(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_created = callback;
    } else {
      console.error(`${this.logprefix} Error setting onCreated callback => the argument is not a function`);
    }
  }

  //#endregion

}

export { ContactForm };
export default ContactForm;