import alert from './dist/alerts.class.js';


export class News {

  constructor(config, callback) {
    this.dom = (typeof config.dom == 'string') ? document.getElementById(config.dom) : config.dom; // DOM objetivo
    this.get = config.get; // Define si obtiene random, single, last o period
    this.permalink = config.permalink; // Link permanente (solo para get = single)
    this.back = config.back || 0; // Cantidad de noticias para atrás desde la última (solo para get = last)
    this.type = config.type; // Define si es de tipo article o list
    this.period = config.interval || { since: JSON.stringify(new Date()).replaceAll('"', ''), until: JSON.stringify(new Date(0)).replaceAll('"', '') }; // Intervalo de obtención de noticias (solo para get = period)
    this.callback = callback;

    if (!config.manual) this.main();
  }


  // Pone en marcha a la clase
  async main() {
    try {
      this.news = await this.request();
      if (this.dom != undefined) this.append(this.news);
      if (this.callback != undefined) this.callback(this.news);
    } catch (error) {
      console.error(error);
    }
  }


  // Obtiene la información de la(s) noticia(s)
  async request() {

    // Genera la URL a necesidad
    const url = () => {
      let url = window.location.origin;
      switch (this.get) {
        case 'single': url = new URL(url + '/api/news/single/' + this.permalink); break;
        case 'random':
          url = new URL(url + '/api/news/random');
          url.searchParams.append('avoid', this.permalink);
          break;
        case 'last':
          url = new URL(url + '/api/news/last');
          url.searchParams.append('back', this.back);
          break;
        case 'period':
          url = new URL(url + '/api/news/period');
          url.searchParams.append('since', this.period.since);
          url.searchParams.append('until', this.period.until);
          break;
        default: throw '[NEWS] config.get is not valid';
      }
      url.searchParams.append('lang', document.getElementById('fmp').attributes.lang.value);
      return url;
    }

    let request = await fetch(url());
    if (request.ok) return await request.json();
    return {error: request.status};
  }


  // Añade la información a necesidad
  append(data) {
    if (data.empty) return;
    switch (this.type) {
      case 'article': this.create_article(data); break;
      case 'list': this.create_list(data); break;
      default: throw '[NEWS] config.type is not valid';
    }
  }


  // Genera un item para una lista
  create_item(data) {

    // Item
    let item = document.createElement('a');
    item.classList.add('news');
    item.href = window.location.origin + '/info/' + data.permalink;

    // Imágenes a la izquierda
    let left = document.createElement('div');

    // Imágen
    let img = document.createElement('img');
        img.setAttribute('src', window.location.origin + data.cover);

    // Tipo de entrada
    let type = document.createElement('span');
        type.innerHTML = data.type || 'APP';

    // Textos a la derecha
    let right = document.createElement('div');

    // Título
    let title = document.createElement('h3');
        title.innerHTML = data.title;

    // Texto
    let text = document.createElement('p');
        text.innerHTML = data.pompadour;

    // Componente
    item.appendChild(left);
    left.appendChild(img);
    left.appendChild(type);
    item.appendChild(right);
    right.appendChild(title);
    right.appendChild(text);

    return item;
  }


  // Genera una lista
  create_list(items) {
    if (items.error != undefined) throw 'Error ' + items.error + ' requesting news list';
    for (const item of items) this.dom.appendChild(this.create_item(item));
  }


  // Genera un artículo
  create_article(data) {

    // Cabecera de la noticia
    const header = (info) => {
      
      // Imágen de portada
      let img = document.createElement('img');
          img.setAttribute('src', info.cover);
          img.setAttribute('alt', info.title);

      let head = document.createElement('section');

      // Título
      let title = document.createElement('h2');
          title.innerHTML = info.title;

      // Copete
      let pmp = document.createElement('p');
          pmp.innerHTML = info.pompadour;

      // Autor
      let auth = category_info(lang.written_by, info.author);

      // Fecha de publicación
      let date = new Date(info.createdAt);
      let d = date.getDate();
      let m = date.getMonth() + 1;
      let y = date.getFullYear();
          date = category_info(lang.date, d + '/' + m + '/' + y);
      
      // Añadido de la información
      this.dom.parentNode.insertBefore(img, this.dom);
      this.dom.appendChild(head);
      head.appendChild(title);
      head.appendChild(pmp);
      head.appendChild(auth);
      head.appendChild(date);
    }

    // Sección
    const section = (info) => {

      // Contenedor
      let section = document.createElement('section');

      // Título de la sección
      let subtitle = document.createElement('h3');
          subtitle.innerHTML = info.title;

      // Texto
      let text = document.createElement('p');
          text.innerHTML = info.content;

      // Unión y retorno
      section.appendChild(subtitle);
      section.appendChild(text);
      return section;
    }

    // Línea de información
    const category_info = (key, value) => {

      // Contenedor
      let ctnr = document.createElement('div');
          ctnr.classList.add('lineinfo');
      
      // Título
      let title = document.createElement('h4');
          title.innerHTML = key;

      // Texto
      let text = document.createElement('p');
          text.innerHTML = value;

      // Unión
      ctnr.appendChild(title);
      ctnr.appendChild(text);

      // Retorno
      return ctnr;
    }

    // Más entradas para visitar
    const more_news = () => {

      // Contenedor
      let section = document.createElement('section');

      // Título de la sección
      let subtitle = document.createElement('h2');
          subtitle.innerHTML = lang.further_reading;

      let more = document.createElement('div');
          more.id = 'more_news';

      new News({get: 'random', dom: more, type: 'list', permalink: this.permalink});

      if (more.childNodes.length > 0) {
        this.dom.appendChild(section);
        section.appendChild(subtitle);
        section.appendChild(more);
      }
    }

    if (data.error != undefined) {
      return alert.fatal({
        icon: 'icon-thumb-down',
        title: lang.error['_' + data.error],
        buttons: [
          { text: lang.retry, action: () => window.location.reload() },
          { text: lang.goback, action: () => window.history.back() }
        ]
      });
    }

    header(data);
    for (const info of data.sections) this.dom.appendChild(section(info));
    more_news();
  }


  // Devuelve las noticias de esta instancia
  get list() { return this.news || [] }

}
