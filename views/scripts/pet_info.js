import alert from '/lib/dist/alerts.class.js';
import { Toast } from '/lib/toast.js';



// - - - - - - - - - - - - - - - - - - - - - - - -
// - PETICIÓN Y MUESTRA DE LA INFORMACIÓN        -
// - - - - - - - - - - - - - - - - - - - - - - - -


// ID de la mascota
var pet_id = window.location.pathname.split('/');
    pet_id = pet_id[pet_id.length - 1];



class PetInfo {

  constructor(id) {
    this.id = id;
    this.data;
    this.skeleton;

    const posts = JSON.parse(localStorage.getItem('pet_posts'));
    this.is_editable = posts != undefined && typeof posts == 'object' && posts[pet_id] != undefined;

    this.build();
  }


  async build() {
    try {
      let info = await this.request_data();
      this.data = format_api_data(info);
      this.skeleton = this.set_skeleton(this.data);

      this.images(this.skeleton.images);
      this.description(this.skeleton.description);
      this.share();
      support_us('#pet');

    } catch (error) {
      console.error(error);
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

  //#region Solicitud y posicionamiento de datos


  // Solicita los datos sobre la mascota
  async request_data() {

    // URL para pedir los datos
    const data_url = () => {
      let url = new URL(window.location.origin + `/api/pets/post/${this.id}`);
      return url;
    }


    const url = data_url();
    const request = await fetch(url);
    const decoded = request.json();
    return decoded;
  }


  // Establece el "esqueleto" del muestreo de la información
  set_skeleton() {
    return {
      images: this.data.pictures,
      description: {
        general_information: {
          disappearance_date: this.data.disappearance_date,
          pet_race: this.data.pet_race,
          disappearance_place: this.data.disappearance_place.address,
          details: this.data.details
        },
        contact: {
          owner_name: this.data.owner_name,
          owner_phone: this.data.owner_phone,
          owner_email: this.data.owner_email,
          owner_home: this.data.owner_home != undefined ? this.data.owner_home.address : null
        },
        secondary: {
          reward: this.data.reward || lang.not_offer
        }
      }
    }
  }


  //#endregion


  //#region Muestreo de información


  // Añade una sección al documento
  add_section(elem) {
    const footer = document.getElementsByTagName('footer')[0];
    footer.parentNode.insertBefore(elem, footer);
  }


  // Genera las imágenes
  images(img_list) {

    // Generador de imagenes
    const create_img = (src, alt) => {
      let img = document.createElement('img');
          img.setAttribute('src', src);
          img.setAttribute('alt', alt);
          img.addEventListener('error', (e) => img_error(e));
          img.id = 'pet_photo';

      return img;
    }

    // Creador del slider de imagenes
    const create_slider = (img_list) => {
      
      var ctnr = document.createElement('div');
          ctnr.classList.add('splide');

      let ctnt = document.createElement('div');
          ctnt.classList.add('splide__track');

      let list = document.createElement('ul');
          list.classList.add('splide__list');

      // Añade cada imagen
      for (let i = 0; i < img_list.length; i++) {
        let item = document.createElement('li');
            item.classList.add('splide__slide');
        
        let img = createimg(img_list[i], this.data.pet_name  + '_' + i);

        item.appendChild(img);
        list.appendChild(item);
      }

      // Une todo
      ctnt.appendChild(list);
      ctnr.appendChild(ctnt);

      new Splide(ctnr, { type: 'loop', speed: 500, autoplay: true, interval: 8000 }).mount(); 

      return ctnr;
    }


    if (img_list.length == 0) throw 'No images';
    let imgs = (img_list.length > 1) ? create_slider(img_list) : create_img(img_list[0], this.data.pet_name);
    this.add_section(imgs);
    
  }


  // Añade toda la descripción, categorías
  // y secciones de la mascota.
  description(obj) {

    const set_categories = (categories) => {
      let ctnr = document.createElement('div');
          ctnr.id = 'pet';

      for (let category in categories) {
        let conf = {name: category};
        switch (category) {
          case 'general_information': conf.id = 'generalinfo'; break;
          case 'contact': conf.id = 'contactinfo'; break;
          case 'secondary': conf.id = 'secondaryinfo'; break;
          default: conf.id = undefined; break;
        }

        const elem = this.category(conf, categories[category]);
        if (category == 'general_information') this.editable(elem);
        ctnr.appendChild(elem);
      }

      return ctnr;
    }

    const categories = set_categories(obj);
    this.add_section(categories);
  }


  // Genera una categoría con información
  category(conf, category) {
    let ctnr = document.createElement('div');
        ctnr.id = conf.id;

    let title = document.createElement('h3');
        title.innerHTML = lang[conf.name];

    ctnr.appendChild(title);

    for (let data in category) {
      if (category[data] != null) {
        const info = this.section(data, category[data], (conf.name == 'general_information') ? true : false);
        ctnr.appendChild(info);
      }
    }

    return ctnr;
  }


  // Genera una línea o item con información
  section(key, value, twoline = false) {
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


  // Crea los botones para compartir
  share() {

    // Generador de botones
    const button = (name) => {

      const twitter_button = (target, text) => {

        // Genera la url de redireccion al hacer click
        const tw_url = (twtext) => {
          let url = new URL('https://twitter.com/share');
              url.searchParams.append('url', window.location.href);
              url.searchParams.append('text', twtext);
              url.searchParams.append('related', 'foundmypet');

          return url;
        }

        const remove_words = (string) => {
          string = string.split('.');
          string.pop();
          string = string.join('.');
        }

        target.addEventListener('click', () => {
          let twtext = text;
          while (twtext.length > (280 - window.location.href.length)) remove_words(twtext);
          if (twtext != text) twtext += '.\n';

          let url = tw_url(twtext);
          window.open(url);
        });
      }

      const whatsapp_button = (target, text) => {

        // Genera la url de redireccion al hacer click
        const wpp_url = (wtext) => {
          let url = new URL('whatsapp://send');
              url.searchParams.append('text', wtext);

          return url;
        }

        target.addEventListener('click', () => {
          let wtext = text;
          wtext += `\n${window.location.href}`;

          const url = wpp_url(wtext);
          window.open(url);
        });
      }

      const facebook_button = (target, text) => {
        target.addEventListener('click', () => {
          FB.ui({
            display: 'popup',
            method: 'share',
            href: window.location.href,
            quote: text
          });
        });
      }

      const messenger_button = (target) => {

        const mssg_url = () => {
          let url = new URL('fb-messenger://share');
              url.searchParams.append('link', window.location.href);

          return url;
        }

        target.addEventListener('click', () => {
          const url = mssg_url();
          window.open(url);
        })
      }

      const telegram_button = (target, text) => {
        
        const tg_url = (text) => {
          let url = new URL('https://telegram.me/share/url');
              url.searchParams.append('text', text);

          return url;
        }

        target.addEventListener('click', () => {
          const url = tg_url(text);
          window.open(url);
        })
      }

      // Genera un botón básico sin funcionalidad específica
      const basic_button = () => {
        let a = document.createElement('a');
            a.classList.add('share_' + name);
            a.target = '_blank';

        let span = document.createElement('span');
        span.classList.add('icon-' + name);
        a.appendChild(span);

        return a;
      }

      // Copia el link al portapapeles
      const copy_link = (target) => {
        target.addEventListener('click', () => {
          try {
            const el = document.createElement('textarea');
            el.value = window.location.href;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';

            document.body.appendChild(el);
            el.select();
            el.setSelectionRange(0, 99999);
            document.execCommand('copy');
            document.body.removeChild(el);

            new Toast({ message: lang.copied_to_clipboard, type: 'success' });
          } catch (error) {
            new Toast({ message: lang.error_copying_clipboard, type: 'warning' });
          }
        });
      }
  

      let sharing_text = lang.sharingtext[name];
      if (sharing_text != undefined) {
        sharing_text = sharing_text.replace('__name__', this.data.pet_name.toUpperCase());
        sharing_text = sharing_text.replace('__date__', this.data.disappearance_date);
        sharing_text = sharing_text.replace('__place__', this.data.disappearance_place.address);
        if (name == 'telegram') sharing_text = sharing_text.replace('__link__', window.location.href);
      }

      let button = basic_button();
      switch (name) {
        case 'twitter': twitter_button(button, sharing_text); break;
        case 'whatsapp': whatsapp_button(button, sharing_text); break;
        case 'facebook': facebook_button(button); break;
        case 'messenger': messenger_button(button); break;
        case 'telegram': telegram_button(button, sharing_text); break;
        case 'link': copy_link(button); break;
        default: break;
      }
      
      return button;
    }


    // Sección
    let ctnr = document.createElement('div');
        ctnr.id = 'share';
  
    // Título
    let title = document.createElement('h3');
        title.innerHTML = lang.spread_case;
  
    // Contenido
    let ctnt = document.createElement('div');
        ctnt.classList.add('wantedpetinfo');
  
    ctnt.appendChild(button('facebook'));
    ctnt.appendChild(button('whatsapp'));
    ctnt.appendChild(button('telegram'));
    ctnt.appendChild(button('twitter'));
    ctnt.appendChild(button('link'));
  
    ctnr.appendChild(title);
    ctnr.appendChild(ctnt);
  
    document.getElementById('pet').appendChild(ctnr);
  }


  //#endregion


  //#region Edición del post


  // Comprueba que la publicación sea editable por el usuario
  editable(elem) {
  
    // Añade el botón de edición
    const add_edit_button = (elem) => {
  
      // Crea el modal con las opciones de edición
      const edit_options = () => {
  
        // Genera las opciónes disponibles para editar la mascota
        const options = () => {
          let buttons = [];
          buttons.push({text: 'Modificar datos', type: 'Secondary', action: this.edit_post});
          if (this.data.found == false) buttons.push({text: '¡Lo encontré!', type: 'Primary', action: this.end_post});
          buttons.push({text: 'Cerrar publicación', type: 'Secondary', action: this.close_post});
  
          return buttons;
        }
  
        const buttons = options();
        alert.info({
          title: 'Editá tu publicación',
          buttons
        });
  
      }
  
      // Genera el botón que despliega las opciónes de edición
      const create_button = () => {
        const icon = document.createElement('span');
            icon.classList.add('icon-edit');
  
        const btn = document.createElement('button');
              btn.id = 'petedit';
              btn.addEventListener('click', edit_options);
        
        btn.appendChild(icon);
        return btn;
      }
  
      
      const button = create_button();
      elem.appendChild(button);
    }
  
  
    if (this.is_editable) add_edit_button(elem);
  }


  // Cierra el post si está disponible
  close_post() {

    // Envía la información al servidor
    const send = async () => {
  
      // Genera el link para enviar la peticion de borrado
      const delete_url = () => {
        const id = posts[pet_id]
        let url = new URL(window.location.origin + `/api/pets/delete/${id}`);
            url.searchParams.append('pet_name', this.data.pet_name);
            url.searchParams.append('owner', this.data.owner_name);
            url.searchParams.append('mail', this.data.owner_email);
            url.searchParams.append('lang', document.getElementsByTagName('html')[0].lang);
        return url;
      }
  
      const url = delete_url();
      const request = await fetch(url, { method: 'DELETE' });
      const decoded = await request.json();
      if (decoded.name != undefined && decoded.message != undefined && decoded != true) throw decoded;
      return decoded;
    }
  
    // Procede una vez confirmada la intención de eliminar el post
    const delete_post = () => {
      alert.modal.destroy();
      alert.info({ title: lang.deleting_post, icon: 'icon-thumb-down' });
  
      const go_to_main_page = () => {
        let url = new URL(window.location.origin);
        window.location.href = url.href;
      }
  
      try {
        send();
        alert.info({
          title: lang.delete_success,
          icon: 'icon-thumb-up',
          buttons: [ {text: lang.goback, action: go_to_main_page, type: 'Primary'} ]
        });
      } catch (error) {
        on_error(error);
      }
    }
  
    // Muestra el modal de error si es necesario,
    // dando la posibilidad de reintentar
    const on_error = (error) => {
      alert.modal.destroy();
      alert.error({
        title: lang.clienterror.went_wrong,
        text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.delete_error,
        icon: 'icon-thumb-down',
        buttons: [
          {text: lang.retry, action: delete_post, type: 'Primary'}
        ]
      });
    }
  
  
    alert.modal.destroy();
    alert.info({
      title: lang.areusure,
      icon: 'icon-thumb-down',
      text: lang.delete_info,
      buttons: [ { text: lang.imsure, type: 'Primary', action: delete_post } ]
    });
  }


  // Notifica que la mascota finalmente fue encontrada
  end_post() {

    // Envía la información al servidor
    const send = async () => {
  
      // Genera la url a la que enviar los datos
      const end_post_url = () => {
        const lang = document.getElementsByTagName('html')[0].lang;
        const id = posts[pet_id];
  
        let url = new URL(window.location.origin);
        url.pathname = `/api/pets/modify/${id}`
        url.searchParams.append('lang', lang);
  
        return url;
      }
  
      // Genera el formdata con los datos necesarios
      const set_data = () => {
        let form_data = new FormData();
        form_data.append('found', true);
        return form_data;
      }
  
      
      const data = set_data();
      const url = end_post_url();
      const request = await fetch(url, { body: data, method: 'PUT' });
      const decoded = await request.json();
  
      if (res.name != undefined && res.message != undefined) throw decoded;
      return decoded;
    }
  
    // Procede una vez confirmada la aparición de la mascota
    const pet_is_back = async () => {
  
      // Genera la url a la que redirigir cuando
      // la mascota se haya marcado como aparecida
      // correctamente
      const ended_post_url = () => {
        let url = new URL(window.location.origin + '/pet/found');
        url.searchParams.append('pet_name', this.data.pet_name);
        return url;
      }
  
      try {
        alert.modal.destroy();
        alert.info({ title: lang.finding_post, icon: 'icon-heart' });
    
        await send();
        const url = ended_post_url();
        window.location.href = url.href;
  
      } catch(error) {
        on_error(error);
      }
    }
  
    // Muestra el modal de error si es necesario,
    // dando la posibilidad de reintentar
    const on_error = (error) => {
      alert.modal.destroy();
      alert.error({
        title: lang.finded_error,
        text: (error.name != undefined) ? lang.apiclienterror[error.name] : lang.clienterror.cant_get_info,
        icon: 'icon-thumb-down',
        buttons: [
          {text: lang.retry, action: pet_is_back, type: 'Primary'}
        ]
      });
    }
  
  
    alert.modal.destroy();
    alert.info({
      title: lang.goodnews,
      icon: 'icon-heart',
      text: lang.finded_info,
      buttons: [
        {text: lang.yesitsback, type: 'Primary', action: pet_is_back}
      ]
    });
  }


  // Redirige a la página de edición de la mascota
  edit_post() {
    const url = new URL(window.location.origin + `/pet/edit/${posts[pet_id]}`);
    window.location.href = url.href;
  }


  //#endregion

}


window.addEventListener('load', () => {
  new PetInfo(pet_id);
});