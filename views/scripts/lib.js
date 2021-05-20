/** Recolección de información introducida en el formulario por el usuario
 * @param {string} form_name - Nombre del form a examinar
 * @param {boolean} deep - Establece si la obtención de campos incluye a aquellos que se encuentren vacíos
 */  
export function getData(form_name, deep = false) {
  
  // Obtención de todos los inputs necesarios
  var entries = document.getElementsByClassName(form_name);
  
  // Creación del objeto con la información
  var info = {};
  var empty_values = [];

  // Añadido de la información
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.value != '' || deep == true) {
      
      // Si la entrada no está vacía se añade y se remueve el estilo de error
      switch (entry.tagName) {
        case 'TEXTAREA':
        case 'INPUT':
          switch (entry.getAttribute('type')) {
            case 'text':
              info[entry.id] = (entry.dataset.coordinates != undefined) ? entry.dataset.coordinates : entry.value;
              break;
            case 'file':
              info[entry.id] = entry.files[0];
              break;
            default:
              info[entry.id] = entry.value;
              break;
          }
          break;
        case 'SELECT':
          info[entry.id] = entry.value;
          break;
        default:
          break;
      }
      entry.classList.remove('inputerror');

    } else if (!entry.classList.contains("optional")) { 

      // Si está vacía y no es opcional se añade como faltante y agrega un estilo de error
      empty_values.push(entry.id);
      entry.classList.add('inputerror');
      
    }
  }

  if (empty_values.length == 0) {
    // Si no hay entradas faltantes se devuelve la información
    return info;
  } else {
    // Caso contrario devuelve un error
    throw 'UndefinedRequiredData';
  }
}

/** Convertidor de JSON a FormData
 * @param {object} data - Objeto a convertir
 */
export function parseJSON(data) {
    const formData = new FormData();
    for (var entry in data) { formData.append(entry, data[entry]); }
    return formData;
}