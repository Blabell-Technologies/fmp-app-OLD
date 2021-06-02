/**
 * @file Crea y administra selects personalizados
 * @author Bruno Emanuel Ferreyra <brunoemanuelferreyra@gmail.com>
 */

/** Callback al cerrar una categoría
 * 
 * @callback onCategoryUnextend
 * @param {string} name - Nombre de la categoría desextendida
 * @param {string} keyword - Palabra identificadora del selector
 */
/** Callback al abrir una categoría
 * 
 * @callback onCategoryExtend
 * @param {string} name - Nombre de la categoría desextendida
 * @param {string} keyword - Palabra identificadora del selector
 */
/** Callback al terminar de crear correctamente el selector
 * 
 * @callback onCreated
 * @param {class} select - Instancia del selector actual
 * @param {string} keyword - Palabra identificadora del selector
 */
/** Callback al hacer una búsqueda dentro del selector
 * 
 * @callback onSearch
 * @param {string} search - Búsqueda hecha por el usuario
 * @param {array} results - Resultados compatibles con esa búsqueda
 */
/** Callback al cerrar el selector personalizado
 * 
 * @callback onClose
 * @param {string} keyword - Palabra identificadora del selector
 */
/** Callback al abrir el selector personalizado
 * 
 * @callback onOpen
 * @param {string} keyword - Palabra identificadora del selector
 */
/** Callback seleccionar una opción
 * 
 * @callback onValueChange
 * @param {string} value - Valor de la opción seleccionada
 */
/**
 * Callback al intentar abrir el select cuando está bloqueado
 * @callback onClickWhenLocked
 * @param {string} keyword - Palabra identificadora del selector
 */

/** Objeto de configuración para crear el selector personalizado
 * @typedef {Object} selectConfig
 * 
 * @property {Array} options - Opciones a desplegar
 * @property {string} keyword - Palabra clave que identifica al selector
 * @property {string} title - Título del selector
 * @property {boolean} [useSearchInput] - Establece si se debe añadir una barra de búsqueda
 * @property {string} [default] - Valor por defecto del selector
 * @property {string} [pleaseSelectText] - Mensaje a mostrar en el select original solicitando que el usuario introduzca un valor
 * @property {boolean} [hideOnValueChange] - Define si el selector se cierra cuando se selecciona una opción
 * @property {boolean} [locked] - Determina si se puede o no abrir el selector
 * 
 * @property {onValueChange} [onValueChange] - Callback seleccionar una opción
 * @property {onOpen} [onOpen] - Callback al abrir el selector personalizado
 * @property {onClose} [onClose] - Callback al cerrar el selector personalizado
 * @property {onSearch} [onSearch] - Callback al hacer una búsqueda dentro del selector
 * @property {onCreated} [onCreated] - Callback al terminar de crear correctamente el selector
 * @property {onCategoryExtend} [onCategoryExtend] - Callback al abrir una categoría
 * @property {onCategoryUnextend} [onCategoryUnextend] - Callback al cerrar una categoría
 * @property {onClickWhenLocked} [onClickWhenLocked] - Callback al intentar abrir el select cuando está bloqueado
 */
/** Selector personalizado
 * @class
 */
class Select {
  
  /** 
   * @param {string} target - Selector original
   * @param {selectConfig} config - Configuración
   */
  constructor(target, config) {
    this.select_dom = (typeof(target) == 'string') ? document.querySelector(target) : target || null;
    this.options = config.options || null;
    this.title = config.title || this.select_dom.name;
    this.put_search_input = config.useSearchInput || true;
    this.keyword = config.keyword || this.select_dom.name;
    this.default = config.default || null;
    this.pre_selected_option = config.pleaseSelectText || 'Select';
    this.capitalize_first_letter = config.capitalizeFirstLetter || true;

    this.callback_value_changed = config.onValueChange || null;
    this.callback_value_changed_hide = config.hideOnValueChange != undefined ? config.hideOnValueChange : true;
    this.callback_on_show = config.onOpen || null;
    this.callback_on_hide = config.onClose || null;
    this.callback_on_search = config.onSearch || null;
    this.callback_on_select_created = config.onCreated || null;
    this.callback_on_category_extend = config.onCategoryExtend || null;
    this.callback_on_category_unextend = config.onCategoryUnextend || null;
    this.callback_on_click_when_locked = config.onClickWhenLocked || null;

    this.locked = config.locked || false;
    this.is_open = false;
    this.self;
    this.head;
    this.body;
    this.list;
    this.selects_list;

    this.create();
  }


  // Genera el selector con todos sus componentes
  async create() {

    // Agrega los listeners necesarios al select original
    const set_original_select = () => {

      const open_selector = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.open();
      }

      const on_option_selected = () => {
        if (this.callback_value_changed != null) this.callback_value_changed(this.select_dom.value, this.keyword); 
        if (this.callback_value_changed_hide == true) this.close();
      }

      this.select_dom.removeEventListener('mousedown', open_selector);
      this.select_dom.removeEventListener('option_selected', on_option_selected);

      this.select_dom.addEventListener('mousedown', open_selector);
      this.select_dom.addEventListener('option_selected', on_option_selected);
    }

    // Introduce al selector personalizado en su contenedor
    const set_select_on_container = () => {
      let selects_list = document.getElementById('selects');
      if (selects_list == undefined) {
        selects_list = document.createElement('div');
        selects_list.id = 'selects';
        document.querySelector('html>body').appendChild(selects_list);
      }
      
      this.selects_list = selects_list;
      this.selects_list.appendChild(this.self);
    }

    // Genera el selector personalizado
    const set_selector = () => {
      this.self = document.createElement('div');
      this.self.classList.add('select', 'select-' + this.keyword);

      this.setHeader(this.title);
      this.setBody(this.options);
      this.setFooter();
    }


    if (!this.options) {
      return console.error(`[${this.keyword.toUpperCase()} SELECT] Can't create select without options`);
    }

    if (!this.select_dom) {
      return console.error(`[${this.keyword.toUpperCase()} SELECT] Can't create select without target DOM`);
    }

    await set_selector();
    await set_select_on_container();
    await set_original_select();
    if (this.callback_on_select_created != null) this.callback_on_select_created(this, this.keyword);
  }


  //#region Creación de componentes y selector

  /** Crea un header para el selector
   * @param {string} title - Título del selector
   */
  setHeader(title) {

    if (!title) {
      return console.error(`[${this.keyword.toUpperCase()} SELECT] Can't set header without title`);
    }

    // Si ya había una cabecera previamente la remueve
    const remove_previous_header = () => {
      let previous_head = this.self.getElementsByClassName('head')[0];
      if (previous_head != null) previous_head.remove();
    }

    // Genera los nuevos elementos
    const create_header = (head_title) => {
      let head = document.createElement('div');
          head.classList.add('head');

      let title = document.createElement('h3');
          title.innerHTML = head_title;

      let x = document.createElement('span');
          x.classList.add('icon-close');
          x.addEventListener('click', () => {
            this.close();
          })

      head.appendChild(title);
      head.appendChild(x);

      return head;
    }

    // Lo añade al selector
    const append_header = (header) => {

      // Si no hay elementos previos simplemente lo añade
      if (this.self.childNodes.length == 0) {
        return this.self.appendChild(header);
      }

      // Si hay elementos previos lo posiciona primero
      let first_elem = this.self.childNodes[0];
      return this.self.insertBefore(header, first_elem); 
    }
   

    const new_header = create_header(title || this.title);
    remove_previous_header();
    append_header(new_header);
    this.head = new_header;
    return new_header;
  }


  /** Crea un cuerpo con opciones para el selector
   * @param {object} options - Opciones a desplegar
   */
  setBody(options) {

    if (!options) {
      return console.error(`[${this.keyword.toUpperCase()} SELECT] Can't create select without options`);
    }

    // Genera el cuerpo del selector
    const create_body = () => {
      this.body = document.createElement('div');
      this.body.classList.add('body');
    }

    // Genera el input de búsqueda si es necesario
    const create_search_input = () => {
      if (this.put_search_input == true) {
        let input = document.createElement('input');
            input.placeholder = 'Buscar';
            input.addEventListener('input', () => {
              this.search(input.value);
            });

        this.body.appendChild(input);
      }
    }

    // Genera la lista de opciones
    const create_list = () => {
      let config = {};
      if (this.keyword != null) config.keyword = this.keyword;
      if (this.default != null) config.default = this.default;
      if (this.callback_on_search != null) config.onSearch = this.callback_on_search;
      if (this.callback_on_category_extend != null) config.onCategoryExtend = this.callback_on_category_extend;
      if (this.callback_on_category_unextend != null) config.onCategoryUnextend = this.callback_on_category_unextend;
      config.capitalizeFirstLetter = this.capitalize_first_letter;
      config.pleaseSelectText = this.pre_selected_option;
      config.select = this.select_dom;
      config.target = this.body;
      config.options = options;
      
      this.list = new Select_list(config);

      if (this.default != null) this.select(this.default, true);
    }

    // Lo añade al selector
    const append_body = () => {
      let footer = this.self.getElementsByClassName('foot')[0];
      if (footer) this.self.insertBefore(this.body, footer);
      else this.self.appendChild(this.body);
    }

    if (this.body) this.body.remove();
    create_body();
    create_search_input();
    create_list();
    append_body();
  }


  // Footer del selector ESTO TODAVÍA NO SE USA
  setFooter() {

    // Elimina el previamente existente
    const remove_previous_footer = () => {
      let previous_foot = this.self.getElementsByClassName('foot')[0];
      if (previous_foot != null) previous_foot.remove();
    }

    // Genera un nuevo pie
    const create_footer = () => {
      let foot = document.createElement('div');
          foot.classList.add('foot');

      return foot;
    }

    // Lo añade al selector
    const append_footer = (footer) => {
      this.self.appendChild(footer);
    }


    let new_footer = create_footer();
    remove_previous_footer();
    append_footer(new_footer);
    return new_footer;

  }

  //#endregion


  //#region Controles

  /** Abre el selector
   */
  open() {
    if (this.locked == false) {
      document.getElementsByTagName('body')[0].classList.add('noscroll');

      // Cierra los select abiertos previamente
      const opened_selects = this.selects_list.querySelectorAll('.select');
      for (let i = 0; i < opened_selects.length; i++) {
        const select = opened_selects[i];
        if (select.classList.contains('shown')) select.classList.remove('shown');
      }

      // Abre el seleccionado
      this.self.classList.add('shown');
      this.selects_list.classList.add('shown');
      if (this.callback_on_show != undefined) this.callback_on_show(this.keyword);

      this.is_open = true;
    } else {
      if (this.callback_on_click_when_locked != null) this.callback_on_click_when_locked(this.keyword);
    }
  }


  /** Cierra el selector
   */
  close() {
    if (this.self.classList.contains('shown')) {
      this.self.classList.remove('shown');
      this.selects_list.classList.remove('shown');
      document.getElementsByTagName('body')[0].classList.remove('noscroll');
      if (this.callback_on_hide != undefined) this.callback_on_hide(this.keyword);
    }
    this.is_open = false;
  }


  /** Selecciona un valor
   * @param {string} value - Valor del elemento a seleccionar
   * @param {boolean} go_to_option - Decide si abrir el camino hasta el elemento seleccionado
   */
  select(value, go_to_option = false) {
    this.list.select(value, go_to_option);
  }


  /** Abre el camino hasta el elemento con el valor especificado
   * @param {string} value - Valor del elemento al cual ir
   */
  goToOption(value) {
    this.list.go_to(value);
  }


  /** Abre el camino hasta la categoría con el nombre especificado
   * @param {string} name - Nombre de la categoría a la cual ir
   */
  openCategory(name) {
    this.list.go_to_category(name);
  }


  /** Busca una opción en la lista
   * @param {string} value - Opción a buscar en la lista
   */
  search(value) {
    this.body.querySelector('input').value = value;
    this.list.search(value);
  }


  /** Desextiende todas las categorías abiertas */
  unextendAll() {
    this.list.unextend_all();
  }

  //#endregion


  //#region Setters

  /** Establece y modifica el estado de bloqueo */
  set lock(bool) {
    if (typeof(bool) == 'boolean') {
      this.locked = bool;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting block state => the data type is wrong`);
    }
  }

  /** Establece y modifica el título del selector */
  set setTitle(title) {
    if (typeof(title) == 'string') {
      this.head.getElementsByTagName('h3')[0].textContent = title;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting title => the data type is wrong`);
    }
  }

  /** Establece una nueva lista de opciones */
  set setOptions(opt) {
    if (typeof(opt) == 'object') {
      this.options = opt;
      this.select_dom.innerHTML = '';
      this.setBody(opt);
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting options list => the data type is wrong`);
    }
  }

  /** Establece un nuevo valor por defecto */
  set setDefault(value) {
    if (typeof(value) == 'string') {
      this.default = value;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting default value => the data type is wrong`);
    }
  }

  /** Modifica el callback al seleccionar un nuevo valor */
  set onValueChange(callback) {
    if (typeof(callback) == 'function') {
      this.callback_value_changed = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onValueChange callback => the argument is not a function`);
    }
  }

  /** Establece si el selector debe cerrarse al seleccionar un nuevo valor */
  set hideOnValueChange(bool) {
    if (typeof(bool) == 'boolean') {
      this.callback_value_changed_hide = bool;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting hideOnValueChange behavior => the data type is wrong`);
    }
  }

  /** Modifica el callback al abrir el selector */
  set onOpen(callback) {
    if (typeof(callback) == 'function') {
      this.on_show = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onOpen callback => the argument is not a function`);
    }
  }

  /** Modifica el callback al cerrar el selector
   * @type {Function}
   */
  set onClose(callback) {
    if (typeof(callback) == 'function') {
      this.on_hide = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onClose callback => the argument is not a function`);
    }
  }

  /** Modifica el callback al hacer una búsqueda */
  set onSearch(callback) {
    if (typeof(callback) == 'function') {
      this.on_search = callback;
      this.list.onSearch = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onSearch callback => the argument is not a function`);
    }
  }

  /** Modifica el callback que se ejecuta cuando el selector termina de crearse por primera vez */
  set onCreated(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_select_created = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onCreated callback => the argument is not a function`);
    }
  }

  /** Modifica el callback al abrir una categoría */
  set onCategoryExtend(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_category_extend = callback;
      this.list.onCategoryExtend = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onCategoryExtend callback => the argument is not a function`);
    }
  }

  /** Modifica el callback al cerrar una categoría 
   * @type {function}
   */
  set onCategoryUnextend(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_category_unextend = callback;
      this.list.onCategoryUnextend = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT] Error setting onCategoryUnextend callback => the argument is not a function`);
    }
  }

  //#endregion


  //#region Getters y solicitudes de estado

  /** Devuelve la ruta hasta la categoría abierta actualmente */
  get openedCategory() {
    return this.list.opened_category_path;
  }

  /** Devuelve el valor de la opción seleccionada */
  get selectedOption() {
    return this.list.selected;
  }

  /** Retorna un booleano representando si el selector está abierto o no */
  get isOpen() {
    return this.is_open;
  }

  //#endregion

}

/** Objeto de configuración para crear el cuerpo con lista del selector personalizado
 * @typedef {Object} bodySelectConfig
 * 
 * @property {HTMLElement|string} target - Elemento HTML en el que se creará el selector
 * @property {Object} options - Opciones a desplegar
 * @property {string} keyword - Palabra clave que identifica al selector
 * @property {string} default - Valor por defecto del selector
 */
/** Cuerpo del selector personalizado
 * @class
 */
class Select_list {

  /**
   * @param {bodySelectConfig} config 
   */
  constructor(config) {
    this.options = config.options || null;
    this.target = config.target || null;
    this.select_dom = config.select || null;
    this.keyword = config.keyword || 'custom_select';
    this.pre_selected_option = config.pleaseSelectText || 'Select';
    this.capitalize_first_letter = config.capitalizeFirstLetter || true;
    
    this.select_dom_changed = new Event('option_selected');

    this.callback_on_search = config.onSearch || null;
    this.callback_on_category_extend = config.onCategoryExtend || null;
    this.callback_on_category_unextend = config.onCategoryUnextend || null;

    this.opened_category;
    this.selected_option;
    this.self;
    this.all_options = [];

    this.create(this.options);
  }


  // Disparador de creación de la lista de opciones
  create(options) {

    // Generación de la lista de opciones
    let options_list = document.createElement('ul');
        options_list.classList.add('options_list');
    this.tree_options(options, options_list);
    this.self = options_list;

    // Añadido al DOM
    this.target.appendChild(this.self);

    this.add_options_to_original_select();
  }


  //#region Creación del listado y componentes necesarios

  /** Genera un item de lista que puede ser tipo opción o subcategoría
   * @param {string} name - Valor a mostrar al usuario en la lista
   * @param {string} value - Valor real de la opción
   * @param {boolean} has_subcategory - Determina si este LI tendrá dentro una subcategoría
   * @returns un LI armado a necesidad para poner en la lista
   */
  new_li(name, value, has_subcategory = true) {

    // Desextiende las subcategorías especificadas
    const unextend_subcategories = (targets) => {
      for (let i = 0; i < targets.length; i++) {
        const element = targets[i];
        element.classList.remove('extended');
        element.classList.remove('hidden');
      }
    }

    // Esconde las subcategorías no seleccionadas
    const hide = (targets, this_item) => {
      for (let i = 0; i < targets.length; i++) {
        const element = targets[i];
        if (element != this_item) {
          element.classList.toggle('hidden');
        }
      }
    }

    // Extiende y desextiende la(s) subcategoría(s) del elemento
    const switch_category = (target, name) => {
      let added_class = target.classList.toggle('extended');
      
      const children_subcategories = target.getElementsByTagName('li');
      if (!added_class) category_unextended(children_subcategories, name);
      else category_extended(name);
      
      const items_of_parent_list = target.parentNode.children;
      hide(items_of_parent_list, target);
    }

    // Callback de desextención de categoría
    const category_unextended = (children_subcategories, category_name) => {
      unextend_subcategories(children_subcategories);
      if (this.callback_on_category_unextend != null) this.callback_on_category_unextend(category_name, this.keyword);
    }

    // Callback de extensión de categoría
    const category_extended = (category_name) => {
      if (this.callback_on_category_extend != null) this.callback_on_category_extend(category_name, this.keyword);
    }

    // Crea la estructura del item
    let li = document.createElement('li');
    let li_text_container = document.createElement('div');
    let li_text = document.createElement('span');
        li_text.innerHTML = (this.capitalize_first_letter) ? this.uppercase_first_letter(name) : name;

    li_text_container.appendChild(li_text);
    li.appendChild(li_text_container);

    // Añade propiedades de subcategoría o de valor según el caso
    if (has_subcategory) {
      li.classList.add('subcategory');
      li_text_container.addEventListener('click', () => switch_category(li, li_text.textContent) );
    } else {
      li.classList.add('value');
      li_text_container.dataset.value = value;
      li_text_container.addEventListener('click', () => this.select_option(li_text_container.dataset.value) );
      this.all_options.push(li);
    }

    return li;
  }


  /** Genera una nueva subcategoría extensible
   * @param {string} sub_name - Nombre de la categoría
   * @param {Object} node - Opciones que pertenecerán a esta categoría en un array
   * @param {HTMLElement} target - DOM de lista en el cual posicionar la nueva categoría
   */
  new_subcategory(sub_name, node, target) {

    // Crea el item de la capa actual
    let li = this.new_li(sub_name); // item de la lista superior

    let sub_ul = document.createElement('ul'); // ul de esta nueva lista
        sub_ul.dataset.path = sub_name || this.keyword;
        
    li.appendChild(sub_ul);
    target.appendChild(li);

    this.tree_options(node, sub_ul);

  }


  /** Genera una opción seleccionable
   * @param {string} name - Nombre del valor que será mostrado al usuario
   * @param {string} value - Nombre real del valor
   * @param {HTMLElement} target - Lista en la cual añadir la opción
   */
  new_option(name, value, target) {

    // Añade la ruta a un elemento
    const add_path_to_item = (item) => {
      let actual_dom = item;
      let path = [];

      
      while(actual_dom) {
        if (actual_dom.nodeName == 'UL') path.push(actual_dom.dataset.path);
        actual_dom = actual_dom.parentNode;
        if (actual_dom.classList[0] == 'options_list') break;
      }

      path = path.reverse();
      path = path.join(' > ');
      item.firstChild.dataset.path = path;
    }

    // Genera un li por cada valor a listar y le añade su ruta
    let li_value = this.new_li(name, value, false);
    target.appendChild(li_value);
    add_path_to_item(li_value);
  }


  /**
   * Transforma la primera letra del texto a mayúsculas
   * @param {string} string Texto a convertir
   * @returns Texto con su primera letra en mayuscula
   */
  uppercase_first_letter(string) {
    let first_letter = string.charAt(0);
        first_letter = first_letter.toUpperCase();
    let sliced_text = string.slice(1);

    return first_letter + sliced_text;
  }


  /** Genera un listado de opciones y subcategorías partiendo de un array que será colocado en donde se indique
   * @param {Object} parent_node - Nodo a recorrer para generar la lista
   * @param {HTMLElement} target - DOM sobre el cual posicionar esta capa
   */
  tree_options(parent_node, target) {

    // Iteración del recorrido de los nodos
    const iteration = (node, dom_target) => {

      const value = node.value;
      const name = node.name;

      // Lo convierte en una categoría o un valor según sea necesario
      if (typeof(value) == 'string') this.new_option(name, value, dom_target);
      else this.new_subcategory(name, value, dom_target);
    }

    // Hace una iteración por cada subnodo
    const iterate = (nodes, target) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        iteration(node, target);
      }
    }

    if (Array.isArray(parent_node)) iterate(parent_node, target);
    else iteration(parent_node, target);
    
  }


  /** Añade las opciones especificadas en el objeto al select original
   */
  add_options_to_original_select() {

    const new_option = (name, value) => {
      let option = document.createElement('option');
          option.textContent = (this.capitalize_first_letter) ? this.uppercase_first_letter(name) : name;
          option.value = value;

      return option;
    }

    let pre_selected_option = new_option(this.pre_selected_option, '');
    pre_selected_option.setAttribute('hidden', 'true');
    pre_selected_option.dataset.type = 'default';
    this.select_dom.appendChild(pre_selected_option);

    for (let i = 0; i < this.all_options.length; i++) {
      const element = this.all_options[i];
      let option = new_option(element.firstChild.textContent, element.firstChild.dataset.value);
      this.select_dom.appendChild(option);
    }
  }

  //#endregion


  //#region Búsqueda

  /** Búsca entre las opciones
   * @param {string} value - Valor a buscar
   */
  search(value) {
    if (value != '') {
      this.turn_search_type_list(value);
      this.show_coincidences(value);
    } else {
      this.turn_tree_type_list();
    }
  }


  /** Muestra solo las coincidencias con el valor especificado
   * @param {string} search_value - Valor a buscar
   */
  show_coincidences(search_value) {

    const correct_text = (text) => {
      text = text.toLowerCase();
      text = text.replace('á', 'a');
      text = text.replace('é', 'e');
      text = text.replace('í', 'i');
      text = text.replace('ó', 'o');
      text = text.replace('ú', 'u');
      return text;
    }

    search_value = correct_text(search_value);
    let childs = this.self.getElementsByClassName('value');
    let found_first = false;
    let results = [];

    for (let i = 0; i < childs.length; i++) {
      const element = childs[i];

      let option_value = correct_text(element.firstChild.firstChild.textContent);
      
      if (option_value.indexOf(search_value) === -1) {
        element.classList.add('hidden');
      } else {
        element.classList.add('shown');
        results.push(element.firstChild.dataset.value);
        if (!found_first) {
          element.classList.add('first');
          found_first = true;
        }
      }
    }

    if (this.callback_on_search != undefined) this.callback_on_search(search_value, results, this.keyword);
  }


  /** Muestra todos los elementos en el listado de búsqueda
   */
  show_all() {
    let hidden = this.self.querySelectorAll('li.value.hidden');
    if (hidden.length > 0) {
      for (let i = 0; i < hidden.length; i++) {
        const element = hidden[i];
        element.classList.remove('hidden');
      }
    }

    let shown = this.self.querySelectorAll('li.value.shown');
    if (shown.length > 0) {
      for (let i = 0; i < shown.length; i++) {
        const element = shown[i];
        element.classList.remove('shown');
      }
    }

    let first_shown = this.self.querySelector('li.first');
    if (first_shown != undefined) first_shown.classList.remove('first');
  }


  /** Convierte el listado a su formato de búsqueda
   */
  turn_search_type_list() {
    this.show_all();
    this.self.classList.add('options_search');
    this.self.classList.remove('options_list');
  }


  /** Convierte el listado a su formato de arbol o jerarquía
   */
  turn_tree_type_list() {
    this.show_all();
    this.self.classList.add('options_list');
    this.self.classList.remove('options_search');
  }

  //#endregion


  //#region Controles

  /** Busca y marca como seleccionada una opción
   * @param {string} value - Valor de la opción a seleccionar
   * @returns el elemento HTML perteneciente a la opción seleccionada
   */
  select_option(value) {

    // Todos los ya seleccionados
    let selected = this.self.getElementsByClassName('selected');

    // Todos los que serán seleccionados
    let selection = this.self.querySelectorAll(`[data-value='${value}']`);

    if (selection.length == 0) {
      return console.error(`[${this.keyword.toUpperCase()} SELECT] There's no options with value ${value}`);
    }

    // Deseleccionar
    for (let i = 0; i < selected.length; i++) {
      const element = selected[i];
      element.classList.remove('selected');
    }

    // Seleccionar nuevos
    for (let i = 0; i < selection.length; i++) {
      const element = selection[i];
      if (!element.parentNode.classList.contains('subcategory')) {
        element.parentNode.classList.add('selected');
      } else {
        console.error(`[${this.keyword.toUpperCase()} SELECT] Can't select subcategory`);
      }
    }

    this.selected_option = value;
    this.select_dom.value = value;
    this.select_dom.dispatchEvent(this.select_dom_changed);

    return selection[0];
  }


  /** Abre el camino hasta una opción con un valor específico
   * @param {string} value - Valor de la opción a la que se quiere ir
   */
  go_to(value) {

    // Abre todas las categorías especificados en el patrón dado
    const go_to_option = (path) => {
      for (let i = 0; i < path.length; i++) {
        const category = path[i];
        let option = this.self.querySelector(`[data-value='${category}']`);
        if (!option.parentNode.classList.contains('extended')) option.click();
      }
    }

    // Obtiene la ruta hasta la opción con el valor especificado
    const get_path_of_option = (value) => {
      let option_to_go = this.self.querySelector(`[data-value='${value}']`);
      let path = option_to_go.dataset.path.replaceAll(' ', '');
      path = path.split('>');
    }


    if (!value) return console.error(`[${this.keyword.toUpperCase()} SELECT] Undefined value to go`);
    this.turn_tree_type_list();
    let path = get_path_of_option(value);
    this.unextend_all();
    if(path) go_to_option(path);    
  }


  /** Abre el camino hasta una categoría con un nombre específico
   * @param {string} name - Nombre de la categoría
   */
  go_to_category(name) {

    const open_category = (category_name) => {
      let actual_dom = this.self.querySelector(`ul[data-path="${category_name}"]`);
      let path = [];
      while(actual_dom) {
        path.push(actual_dom);
        actual_dom = actual_dom.parentNode.parentNode;
        if (actual_dom.classList[0] == 'options_list') break;
      }
      path = path.reverse();
      for (let i = 0; i < path.length; i++) {
        const category = path[i];
        category.previousSibling.click();
      }
    }

    this.unextend_all();
    open_category(name);

  }


  /** Desextiende todos las las subcategorías abiertas
   */
  unextend_all() {
    let extended = this.self.getElementsByClassName('extended');
    for (let i = 0; i < extended.length; i++) {
      const element = extended[i];
      element.firstChild.click();
    }
  }


  /** Selecciona y abre todas las categorías hasta una opción específica
   * @param {string} value - Valor real de la opción a seleccionar
   * @param {boolean} go_to_option - Determina si al seleccionar la opción también se tienen que abrir las categorías necesarias para llegar hasta ella
   * @returns 
   */
  select(value, go_to_option = false) {
    let selected = this.select_option(value);
    if (go_to_option) {
      if (selected.dataset.path == undefined) {
        return console.error(`[${this.keyword.toUpperCase()} SELECT] Can't go to subcategory item`);
      }
      this.go_to(selected.dataset.value);
    }
  }

  //#endregion


  //#region Solicitudes de estado

  /** Devuelve el valor real de la opción seleccionada actualmente */
  get selected() {
    return this.selected_option;
  }

  /** Devuelve un array con la ruta hasta la opción seleccionada actualmente */
  get opened_category_path() {
    let extended_categories = this.self.getElementsByClassName('extended');
    let path = [];
    for (let i = 0; i < extended_categories.length; i++) {
      const element = extended_categories[i];
      path.push(element.firstChild.textContent);
    }
    return path;
  }

  //#endregion


  //#region Setters

  /** Modifica el callback al hacer una búsqueda */
  set onSearch(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_search = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT BODYLIST] Error setting onSearch callback => the argument is not a function`)
    }
  }

  /** Modifica el callback al extender una categoría */
  set onCategoryExtend(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_category_extend = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT BODYLIST] Error setting onCategoryExtend callback => the argument is not a function`)
    }
  }

  /** Modifica el callback al retraer una categoría */
  set onCategoryUnextend(callback) {
    if (typeof(callback) == 'function') {
      this.callback_on_category_unextend = callback;
    } else {
      console.error(`[${this.keyword.toUpperCase()} SELECT BODYLIST] Error setting onCategoryUnextend callback => the argument is not a function`)
    }
  }

  //#endregion

}


export { Select };
export default Select;