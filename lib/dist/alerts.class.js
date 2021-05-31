import { Toast } from '../toast.js';
import micromodal from '../modal.js';
class Alert {
    constructor() {
        this.modal = new Modal();
    }
    /** Despliega una pantalla de error fatal, borrando todo el resto de la página
     * @param {object} data - Información a desplegar en la pantalla de error
     * @param {string} [data.icon] - Ícono que se va a mostrar
     * @param {string} data.title - Título del error
     * @param {string} [data.text] - Texto del error
     * @param {object[]} [data.buttons] - Lista de botones a desplegar
     * @param {object} [data.buttons] - Objeto de cada botón
     * @param {string} [data.buttons[].text] - Texto del botón
     * @param {function} [data.buttons[].action] - Función a ejecutar cuando el botón sea clickeado
     */
    fatal(data) {
        // Obtencion del cuerpo de la página
        let body = document.getElementsByTagName('body')[0];
        // Para cada elemento dentro...
        for (let i = 0; i < body.childNodes.length; i++) {
            // Lo elimina si no es un componente principal
            const e = body.children[i];
            switch (e.id) {
                case 'header':
                case 'footer':
                case 'appinstall':
                case 'iosappinstall':
                case 'appupdate':
                    break;
                default:
                    e.remove();
                    break;
            }
        }
        // Genera un nuevo contenedor
        let errorbody = document.createElement('div');
        errorbody.id = 'error';
        // Lista de elementos
        let elements = [];
        // Creación del icono
        let span = document.createElement('span');
        span.classList.add(data.icon != undefined ? data.icon : 'icon-thumb-down');
        elements.push(span);
        // Creación del título
        let title = document.createElement('h2');
        title.innerHTML = data.title;
        elements.push(title);
        // En caso de que haya texto, se crea y se añade a la lista
        if (data.text) {
            let text = document.createElement('p');
            text.innerHTML = data.text;
            elements.push(text);
        }
        // En caso de que haya botones
        if (data.buttons) {
            // Creacion del contenedor de los botones
            let buttons = document.createElement('div');
            for (let i = 0; i < data.buttons.length; i++) {
                const elem = data.buttons[i];
                let btn = document.createElement('button');
                btn.innerHTML = elem.text;
                btn.addEventListener('click', elem.action);
                buttons.appendChild(btn);
            }
            // Se agrega el contenedor a la lista
            elements.push(buttons);
        }
        // Para cada elemento de la lista...
        for (let i = 0; i < elements.length; i++) {
            // Se agrega al body
            errorbody.appendChild(elements[i]);
        }
        body.insertBefore(errorbody, document.getElementsByTagName('footer')[0]);
    }
    /** Muestra y genera un modal de tipo error
     * @param {object} data - Opciones del modal a mostrar
     * @param {string} data.title - Título del modal
     * @param {string} [data.text] - Texto del modal
     * @param {string} [data.icon] - Ícono del modal según el pack de iconos actual
     * @param {'success'|'warning'|'danger'|'default'} data.type - Típo de notificación
     * @param {object[]} [data.buttons] - Lista de botones a desplegar
     * @param {object} [data.buttons] - Objeto de cada botón
     * @param {string} [data.buttons[].text] - Texto del botón
     * @param {function} [data.buttons[].action] - Función a ejecutar cuando el botón sea clickeado
     * @param {'primary'|'secondary'} [data.buttons[].type] - Tipo de botón|
     * @param {number} [data.destroy_on] - Tiempo en el que se destruirá el modal
     * @param {number} [data.hide_on] - Tiempo en el que se ocultará el modal
     */
    error(data) {
        data.type = 'danger';
        this.modal.show(data);
    }
    /** Genera un toast notificando una advertencia
     * @param {object} data - Opciones del toast a mostrar
     * @param {string} data.msg - Texto del toast
     * @param {object[]} [data.buttons] - Botones del toast
     * @param {string} [data.buttons[].text] - Texto del botón
     * @param {function} [data.buttons[].action] - Acción a ejecutar cuando se cilckeé el botón
     * @param {'primary'|'secondary'} [data.buttons[].type] - Tipo de botón
     */
    warn(data) {
        new Toast({ message: data.msg, type: 'warning', buttons: data.buttons });
    }
    /** Muestra y genera un modal de tipo información
     * @param {object} data - Opciones del modal a mostrar
     * @param {string} data.title - Título del modal
     * @param {string} [data.text] - Texto del modal
     * @param {string} [data.icon] - Ícono del modal según el pack de iconos actual
     * @param {'success'|'warning'|'danger'|'default'} data.type - Típo de notificación
     * @param {object[]} [data.buttons] - Lista de botones a desplegar
     * @param {object} [data.buttons] - Objeto de cada botón
     * @param {string} [data.buttons[].text] - Texto del botón
     * @param {function} [data.buttons[].action] - Función a ejecutar cuando el botón sea clickeado
     * @param {'primary'|'secondary'} [data.buttons[].type] - Tipo de botón|
     * @param {number} [data.destroy_on] - Tiempo en el que se destruirá el modal
     * @param {number} [data.hide_on] - Tiempo en el que se ocultará el modal
     */
    info(data) {
        data.type = 'success';
        this.modal.show(data);
    }
}
class Modal {
    constructor() {
        // Variables de toda la clase
        this.body = document.getElementsByTagName('body')[0];
        this.buttons = [];
        // Al iniciarse el elemento, se crea el fondo del modal,
        // que es el lugar en donde todos van a estar
        this.background();
    }
    /** Genera el fondo del modal, lugar donde se despliega cada uno */
    background() {
        // Si el fondo no existe...
        if (!document.getElementById('modal')) {
            // Se crea
            let modal_background = document.createElement('div');
            modal_background.classList.add('modal');
            modal_background.id = 'modal';
            // Se añade al documento
            this.body.appendChild(modal_background);
            // Se inician las funcionalidades de modals
            micromodal.init();
        }
    }
    /** Genera un nuevo modal
     * @param {object} options - Opciones del modal a mostrar
     * @param {string} options.title - Título del modal
     * @param {string} [options.text] - Texto del modal
     * @param {string} [options.icon] - Ícono del modal según el pack de iconos actual
     * @param {'success'|'warning'|'danger'|'default'} options.type - Típo de notificación
     * @param {object[]} [options.buttons] - Lista de botones a desplegar
     * @param {object} [options.buttons] - Objeto de cada botón
     * @param {string} [options.buttons[].text] - Texto del botón
     * @param {function} [options.buttons[].action] - Función a ejecutar cuando el botón sea clickeado
     * @param {'primary'|'secondary'} [options.buttons[].type] - Tipo de botón
     */
    create(options) {
        // Contenedor
        let container = document.createElement('div');
        // Lista de elementos a mostrar en el modal
        let elements = [];
        // Si se quiere añadir un ícono, se crea y se suma a la lista
        if (options.icon) {
            let icon = document.createElement('span');
            icon.classList.add(options.icon, options.type);
            elements.push(icon);
        }
        // Si se quiere añadir un título, se crea y se suma a la lista
        if (options.title) {
            let title = document.createElement('h3');
            title.innerHTML = options.title;
            elements.push(title);
        }
        // Si se quiere añadir un texto, se crea y se suma a la lista
        if (options.text) {
            let text = document.createElement('p');
            text.innerHTML = options.text;
            elements.push(text);
        }
        // Si no hay botones, crea la entrada de todas formas para añadir el de cerrar
        if (!options.buttons) {
            options.buttons = [];
        }
        // Contenedor de los botones
        let buttons = document.createElement('div');
        // Añadido del botón de cerrar a la lista
        options.buttons.push({ text: 'Cerrar', action: () => this.hide(), type: 'secondary' });
        // Se establecen como variable global para así tener las funciones
        // de cada botón para luego poder borrar sus event listener
        this.buttons = options.buttons;
        // Para cada objeto en el array de botones...
        for (let i = 0; i < options.buttons.length; i++) {
            // Se crea el botón con el texto deseado
            let button = document.createElement('button');
            button.innerHTML = options.buttons[i].text;
            if (options.buttons[i].type != undefined) {
                button.classList.add(options.buttons[i].type);
            }
            // Se añade su listener con la función pasada
            button.addEventListener('click', options.buttons[i].action);
            // Se añade al contenedor de botones
            buttons.appendChild(button);
        }
        // Se suma a la lista de elementos del modal
        elements.push(buttons);
        // Se añade cada elemento al contenedor principal
        for (let i = 0; i < elements.length; i++) {
            container.appendChild(elements[i]);
        }
        // Se retorna el modal listo
        return container;
    }
    /** Muestra un modal
     * @param {object} options - Opciones del modal a mostrar
     * @param {string} options.title - Título del modal
     * @param {string} [options.text] - Texto del modal
     * @param {string} [options.icon] - Ícono del modal según el pack de iconos actual
     * @param {'success'|'warning'|'danger'|'default'} options.type - Típo de notificación
     * @param {object[]} [options.buttons] - Lista de botones a desplegar
     * @param {object} [options.buttons] - Objeto de cada botón
     * @param {string} [options.buttons[].text] - Texto del botón
     * @param {function} [options.buttons[].action] - Función a ejecutar cuando el botón sea clickeado
     * @param {'primary'|'secondary'} [options.buttons[].type] - Tipo de botón
     * @param {number} [options.destroy_on] - Tiempo en el que se destruirá el modal
     * @param {number} [options.hide_on] - Tiempo en el que se ocultará el modal
     */
    show(options) {
        // Comprueba que haya fondo y lo obtiene
        this.background();
        let background = document.getElementById('modal');
        if (background.childNodes.length > 0) {
            this.destroy();
        }
        // Añade el modal solicitado
        background.appendChild(this.create(options));
        // Lo muestra
        micromodal.show('modal');
        // En caso de que se hayan pasado parametros de quitar o destruir,
        // se añaden sus timeouts con el tiempo especificado
        if (options.quit_on) {
            setTimeout(() => this.hide(), options.quit_on);
        }
        if (options.destroy_on) {
            setTimeout(() => this.destroy(), options.destroy_on);
        }
    }
    /** Esconde un modal */
    hide() {
        micromodal.close('modal');
    }
    /** Destruye un modal */
    destroy() {
        // Fondo del modal
        let modal = document.getElementById('modal');
        // Se obtienen todos los botones que tiene el modal
        let buttons = modal.getElementsByTagName('button');
        // A cada botón se le remueve su listener con sus funciones correspondientes
        // previamente almacenadas en this.buttons
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeEventListener('click', this.buttons[i].action);
        }
        // En caso de que haya algun objeto removible
        if (modal.childNodes.length > 0) {
            // Eliminar el modal
            modal.childNodes[0].remove();
            // Se esconde el fondo de modals
            this.hide();
        }
        // La variable de los datos de los botones se reestablece
        this.buttons = null;
    }
}
const alert = new Alert();
export { Alert, alert };
export default alert;
