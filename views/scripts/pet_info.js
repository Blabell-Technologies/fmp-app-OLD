import alert from '/lib/dist/alerts.class.js';




// - - - - - - - - - - - - - - - - - - - - - - - -
// - PETICIÓN Y MUESTRA DE LA INFORMACIÓN        -
// - - - - - - - - - - - - - - - - - - - - - - - -


// ID de la mascota
var pet_id = window.location.pathname.split('/');
    pet_id = pet_id[pet_id.length - 1];


// Variable donde se almacenará la información traída
var pet_info;


// Obtiene el almacenamiento local de las publicaciones realizadas
const pets_posted = JSON.parse(localStorage.getItem('pet_posts'));


// Genera la estructura de la información con los datos solicitados
const skeleton = (data) => {
  return {
    images: data.pictures,
    description: {
      general_information: {
        disappearance_date: data.disappearance_date,
        pet_race: data.pet_race,
        disappearance_place: data.disappearance_place.address,
        details: data.details
      },
      contact: {
        owner_name: data.owner_name,
        owner_phone: data.owner_phone,
        owner_email: data.owner_email,
        owner_home: data.owner_home != undefined ? data.owner_home.address : null
      },
      secondary: {
        reward: data.reward || lang.not_offer
      }
    }
  }
}


// Solicita los datos de la mascota
async function get_data() {

  try {
    
    // Petición y decodificación
    const request = await fetch(`/api/pets/post/${pet_id}`);
    const decoded = await request.json();
  
    // Formato
    pet_info = format_api_data(decoded);

    // Esqueleto de información
    const ordered_info = skeleton(pet_info);

    // Creación de los elementos que muestran la información
    images(ordered_info.images);
    description(ordered_info.description);
    share();
    support_us('#pet');

  } catch (error) {
    console.error(error);
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


// Crea el slider de imagenes y lo añade
function images(arr) {

  // Generador de imagenes
  const createimg = (src, alt) => {
    let img = document.createElement('img');
        img.setAttribute('src', src);
        img.setAttribute('alt', alt);
        img.addEventListener('error', (e) => img_error(e));
        img.id = 'pet_photo';

    return img;
  }

  // En caso de que solo haya una imagen
  if (arr.length <= 1) {

    // Simplemente la añade
    var ctnr = createimg(arr[0], pet_info.pet_name);

  // Si hay más de una imagen
  } else {

    // Genera los elementos necesarios para el slider
    var ctnr = document.createElement('div');
        ctnr.classList.add('splide');

    let ctnt = document.createElement('div');
        ctnt.classList.add('splide__track');

    let list = document.createElement('ul');
        list.classList.add('splide__list');

    // Añade cada imagen
    for (let i = 0; i < arr.length; i++) {
      let item = document.createElement('li');
          item.classList.add('splide__slide');
      
      let img = createimg(arr[i], pet_info.pet_name  + '_' + i);

      item.appendChild(img);
      list.appendChild(item);
    }

    // Une todo
    ctnt.appendChild(list);
    ctnr.appendChild(ctnt);
  }

  // Lo añade al documento
  add_data(ctnr);

  // Inicia la funcionalidad del slider
  try {
    document.onload = new Splide('.splide', { type: 'loop', speed: 500, autoplay: true, interval: 8000 }).mount(); 
  } catch (err) { 
    switch (err.toString()) {
      case 'Error: An invalid element/selector was given.':
        break;
      default:
        console.error(err);      
        break;
    }
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

  // Añade el boton de edicion si es necesario
  editable(ctnr);

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

      // Genera una linea de información
      const info = category_info(line, cat[line], (conf.name == 'general_information') ? true : false);
  
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
      ctnr.classList.add(twoline ? 'twolines' : 'oneline', 'wantedpetinfo');
      if (key == 'owner_email') ctnr.classList.add('nocap');
  
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


// Añade elementos al documento
function add_data(elem) {
  const footer = document.getElementsByTagName('footer')[0];
  footer.parentNode.insertBefore(elem, footer);
}




// - - - - - - - - - - - - - - - - - - - - - - - -
// - DIFUSIÓN DEL POST                           -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Agrega los botones para compartir
function share() {

  // Sección
  let ctnr = document.createElement('div');
      ctnr.id = 'share';

  // Título
  let title = document.createElement('h3');
      title.innerHTML = lang.spread_case;

  // Contenido
  let ctnt = document.createElement('div');
      ctnt.classList.add('wantedpetinfo');

  // Generador de botones
  const button = (name) => {

    // Vínculo
    let a = document.createElement('a');
        a.classList.add('share_' + name);
        a.target = '_blank';

    // Texto a mostrar
    let text = lang.sharingtext[name];
        text = text.replace('__name__', pet_info.pet_name.toUpperCase());
        text = text.replace('__date__', pet_info.disappearance_date);
        text = text.replace('__place__', pet_info.disappearance_place.address);

    // Dependiendo de a que red social pertenezca el botón...
    switch (name) {

      case 'twitter':
        a.addEventListener('click', () => {

          // Genera una nueva variable con el texto para ser modificada
          let twtext = text;

          // Siempre y cuando el largo del parrafo sea mayor al permitido por twitter
          while (twtext.length > (280 - window.location.href.length)) {

            // Lo divide por oraciones
            twtext = twtext.split('.');

            // Elimina la última
            twtext.pop();

            // Une todo nuevamente
            twtext = twtext.join('.');
          }

          // Añade un punto final y un salto de linea para posteriormente poner el link
          if (twtext != text) twtext += '.\n';
          
          // Genera la url de redireccion al hacer click
          let url = new URL('https://twitter.com/share');
              url.searchParams.append('url', window.location.href);
              url.searchParams.append('text', twtext);
              url.searchParams.append('related', 'foundmypet');

          // Abre twitter
          window.open(url);
        });
        break;

      case 'whatsapp':
        a.addEventListener('click', () => {

          let wtext = text;
          wtext += `\n${window.location.href}`;

          // Genera la url de redireccion al hacer click
          let url = new URL('whatsapp://send');
              url.searchParams.append('text', wtext);

          // Abre whatsapp
          window.open(url);
        });
        break;

      default:
        break;
    }
    
    // Icono
    let span = document.createElement('span');
        span.classList.add('icon-' + name);

    // Añadido del icono al vinculo
    a.appendChild(span);

    // Retorno del botón generado
    return a;
  }

  ctnt.appendChild(button('twitter'));
  ctnt.appendChild(button('whatsapp'));

  ctnr.appendChild(title);
  ctnr.appendChild(ctnt);

  document.getElementById('pet').appendChild(ctnr);
}

// - - - - - - - - - - - - - - - - - - - - - - - -
// - MODIFICACIÓN DEL POST                       -
// - - - - - - - - - - - - - - - - - - - - - - - -


// Comprueba que la publicación sea editable por el usuario
function editable(elem) {

  // En caso de que existan publicaciones realizadas...
  if (pets_posted != undefined && typeof pets_posted == 'object') {

    // Y esta sea una de ellas...
    if (pets_posted[pet_id] != undefined) {

      // Genera el boton de edición
      const edit_button = document.createElement('button');
            edit_button.id = 'petedit';

      // Genera el ícono de edición
      const edit_icon = document.createElement('span');
            edit_icon.classList.add('icon-edit');

      // Añadido al documento
      edit_button.appendChild(edit_icon);
      elem.childNodes[0].appendChild(edit_button);
      
      // Al pulsar el botón...
      edit_button.addEventListener('click', () => {
      
        // Genera los botones necesarios
        let buttons = [];
        buttons.push({text: 'Modificar datos', type: 'Secondary', action: () => edit_post()});
        if (pet_info.found == false) buttons.push({text: '¡Lo encontré!', type: 'Primary', action: async () => end_post()});
        buttons.push({text: 'Cerrar publicación', type: 'Secondary', action: async () => close_post()});
      
        // Muestra un modal preguntando que se desea editar
        alert.info({
          title: 'Editá tu publicación',
          text: `¿Que hay de nuevo con ${pet_info.pet_name}?`,
          buttons
        });
      });
    }
  }
}


// Cierra el post si está disponible
async function close_post() {

  // Cierra todos los modals si es que los hay
  alert.modal.destroy();

  // Genera un nuevo modal informando sobre el borrado de la publicación
  alert.info({
    title: lang.areusure,
    icon: 'icon-thumb-down',
    text: lang.delete_info,
    buttons: [
      {text: lang.imsure, type: 'Primary', action: async () => {

        // Al continuar...
        try {

          // Muestra un nuevo modal notificando que la publicacion se está eliminando
          alert.info({
            title: lang.deleting_post,
            icon: 'icon-thumb-down'
          });

          // Genera el link para enviar la peticion de borrado
          let url = new URL(`/api/pets/delete/${pets_posted[pet_id]}`, window.location.origin);
              url.searchParams.append('pet_name', pet_info.pet_name);
              url.searchParams.append('owner', pet_info.owner_name);
              url.searchParams.append('mail', pet_info.owner_email);
              url.searchParams.append('lang', document.getElementsByTagName('html')[0].lang);

          // Hace la petición
          const request = await fetch(url, { method: 'DELETE' });
          const decoded = await request.json();
      
          // Si es correcta...
          if (decoded.name == undefined && decoded.message == undefined && decoded == true) {

            alert.info({
              title: lang.delete_success,
              icon: 'icon-thumb-up',
              buttons: [
                {text: lang.goback, action: () => { window.location.href = window.location.origin }, type: 'Primary'}
              ]
            });

          } else throw decoded;

        } catch(error) {

          // Al haber un error elimina todos los modals previamente existentes
          alert.modal.destroy();

          // Genera un nuevo modal informando que algo fallo y permitiendo reintentar
          alert.error({
            title: lang.clienterror.went_wrong,
            text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.delete_error,
            icon: 'icon-thumb-down',
            buttons: [
              {text: lang.retry, action: () => close_post(), type: 'Primary'}
            ]
          });
        }
      }}
    ]
  });
}


// Notifica que la mascota finalmente fue encontrada
async function end_post() {

  // Elimina los modals existentes
  alert.modal.destroy();

  // Genera un nuevo modal felicitando por la aparición
  alert.info({
    title: lang.goodnews,
    icon: 'icon-heart',
    text: lang.finded_info,
    buttons: [
      {text: lang.yesitsback, type: 'Primary', action: async () => {

        // Al confirmar la aparición...
        try {

          // Elimina modals
          alert.modal.destroy();

          // Notifica que la aparición se está reportando
          alert.info({
            title: lang.finding_post,
            icon: 'icon-heart'
          });
      
          // Genera el formdata con los datos necesarios
          let form_data = new FormData();
          form_data.append('found', true);
      
          // Hace la petición
          const request = await fetch(`/api/pets/modify/${pets_posted[pet_id]}?lang=${document.getElementsByTagName('html')[0].lang}`, {body: form_data, method: 'PUT'});
          const decoded = await request.json();

          console.log(decoded);
      
          // Al ser correcta
          if (decoded.name == undefined && decoded.message == undefined) {

            // Redirige a la página de felicitaciones por haber encontrado a la mascota
            const url = new URL('/pet/found', window.location.origin);
                  url.searchParams.append('pet_name', pet_info.pet_name);
            window.location.href = url.href;

          } else throw decoded;

        } catch(error) {

          // Elimina otros modals
          alert.modal.destroy();

          // Genera uno nuevo notificando que algo falló y permitiendo reintentar
          alert.error({
            title: lang.finded_error,
            text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.clienterror.cant_get_info,
            icon: 'icon-thumb-down',
            buttons: [
              {text: lang.retry, action: () => {end_post()}, type: 'Primary'}
            ]
          });
        }
      }}
    ]
  });
}


// Redirige a la página de edición de la mascota
function edit_post() {
  const url = new URL(`/pet/edit/${pets_posted[pet_id]}`, window.location.origin);
  window.location.href = url.href;
}


window.onload = get_data();
