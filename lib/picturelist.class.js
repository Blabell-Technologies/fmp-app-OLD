/**
 * @file Crea y administra listas de imágenes interactivas
 * @author Bruno Emanuel Ferreyra <brunoemanuelferreyra@gmail.com>
 */

/** Objeto de configuración de la lista de imágenes interactiva
 * @typedef {Object} PictureListConfig
 * 
 * @property {string} keyword - Palabra clave para generar los nuevos input
 * @property {number} [limit] - Límite de imágenes que se pueden añadir a la lista
 */
/** Lista de imágenes interactiva
 * 
 * Genera la lista de imagenes y toda la lógica necesaria
 * para generar nuevos inputs, borrarlos y relacionarlos
 * entre ellos
 * 
 * @class
 */
class PictureList {

  /**
   * @param {HTMLElement|string} target - Objetivo donde crear el listado
   * @param {PictureListConfig} config - Configuración
   */
  constructor(target, config) {
    this.list = (typeof(target) == 'string') ? document.querySelector(target) : target || null;
    this.keyword = config.keyword || 'file_';
    this.limit = config.limit || 5;
    this.counter = 0;

    this.create_input(this.#input_id, false);

    if (!navigator.platform.match(/iPhone|iPod|iPad/gm)){
      Sortable.create(this.list, {
        animation: 150,
        delayOnTouchOnly: true,
        delay: 100,
        ghostClass: 'blue-background-class',
        filter: '.sort-ignore',
        onEnd: () => this.#reorder_id()
      });
    }
  }

  /** Genera un input rellenable con una imágen
   * @param {string} name - ID del input
   * @param {boolean} optional - Determina si el input es opcional o no
   */
  create_input(id, optional = true) {

    // Muestra la opción de eliminar imagen
    const show_delete_option = (span) => {
      span.classList.remove('hidden');
      setTimeout(() => { span.classList.add('hidden'); }, 3000);
    }

    // Callback que añade la vista previa de la imagen seleccionada sobre el input
    const on_image_selected = (input, image) => {

      let label = input.parentNode;
      let img = label.getElementsByTagName('img')[0];
      let span = label.getElementsByTagName('span')[0];

      let file_reader = new FileReader();
      file_reader.onload = function(event) {

        label.classList.remove('sort-ignore');

        input.classList.remove('optional');
        input.setAttribute('disabled', true);
        
        img.setAttribute('src', event.target.result);
        img.classList.remove('hidden');
      }

      // Introducir el archivo
      file_reader.readAsDataURL(image);

      // Añade los callbacks
      img.addEventListener('click', () => { show_delete_option(span); });
      span.addEventListener('click', () => { this.delete_input(label); });
    }

    // Dispara la modificación del input con la imagen seleccionada
    // y decide si crear un input nuevo dependiendo de el máximo
    const on_input_change = (e) => {
      e.stopPropagation();
      let input = e.target;
      const files = input.files;
      if (files.length > 0) {
        on_image_selected(input, files[0]);
        if (this.length < this.limit) {
          this.create_input(this.#input_id);
        }
      }
    }


    if (this.length <= this.limit) {
      let label = document.createElement('label');
          label.classList.add('custom-input-file', 'sort-ignore');
          label.setAttribute('for', id);
          label.setAttribute('type', 'file');
          label.innerHTML = '+';
          label.addEventListener('change', on_input_change);
          
      let img = document.createElement('img');
          img.classList.add('hidden');
          img.alt = '';
          
      let input = document.createElement('input');
          input.classList.add('addpet', 'input-file');
          if (optional == true) input.classList.add('optional');
          input.name = id;
          input.id = id;
          input.type = 'file';
          input.accept = 'image/jpeg,image/jpeg';
          
      let span = document.createElement('span');
          span.classList.add('typcn', 'icon-close', 'typcn-times', 'hidden');

      label.appendChild(img);
      label.appendChild(input);
      label.appendChild(span);
      this.list.appendChild(label);
      this.counter++;
      return label;
    }
    console.error(`[PICTURE LIST] Can't create another input => limit reached`);    
  }

  /** Elimina un input con valor
   * @param {(HTMLElement|string)} id - Objeto a eliminar o su selector
   */
  delete_input(id) {
    let label = (typeof(id) == 'string') ? this.list.querySelector(`[for='${id}']`) : id;
    if (label != undefined) {
      if (label.querySelector('[disabled="true"]') != undefined) {
        label.remove();
        this.#reorder_id();
        this.counter--;
        if (this.length == this.limit) this.create_input(this.#input_id);
        return;
      }
      console.error(`[PICTURE LIST] Can't remove input without image`);
      return;
    }
    console.error(`[PICTURE LIST] Can't find input with id ${id}`);
  }

  /** Reordena las id de los input en la lista */
  #reorder_id() {
    let labels = this.list.childNodes;

    // Reordena las ID
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const input = label.getElementsByTagName('input')[0];
      const new_id = this.keyword + i;

      label.setAttribute('for', new_id);
      input.setAttribute('name', new_id);
      input.id = new_id;
    }

    // En caso de que no haya ninguna imagen obligatoria, la añade
    let optionals = this.list.querySelectorAll('input:not(.optional)');
    if (optionals.length == 0) {
      let input = labels[0].getElementsByTagName('input')[0];
      input.classList.remove('optional');
    }
  }

  /** Obtiene la cantidad de input con imágenes asignadas que hay en la lista */
  get length() {
    return this.list.querySelectorAll('[disabled="true"]').length + 1;
  }

  /** Obtiene la id del input que se debe colocar a continuación */
  get #input_id() {
    return this.keyword + this.counter;
  }

  /** Obtiene la lista de imágenes seleccionadas por el usuario */
  get fileList() {
    let result = [];
    let files_input = this.list.querySelectorAll('[disabled="true"]');
    for (const input of files_input) {
      let file = input.files[0];
      result.push(file);
    }
    return result;
  }

}

export { PictureList };
export default PictureList;