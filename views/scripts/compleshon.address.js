const compleshon_address = () => {
  /** Obtiene datos de autocompletado de Photon
   * 
   * @param {string} query Paramertro de consulta
   * @param {[number, number]} coordinates Latitud y longitud
   * @param {number} [limit=5] Limite maximo de datos a obtener
   * 
   */
  const photon_suggestion = async (query, coordinates, limit = 5) => {
    // Peticiónado de datos a photon
    const photon_request = await fetch(`https://photon.komoot.io/api/?q=${query}&lat=${coordinates[0]}&lon=${coordinates[1]}&limit=${limit}`);
    /** Decodificación de la respuesta de la petición}
     * @typedef {{coordinates: [number, number], type: 'Point'}} Geometry
     * @typedef {{ osm_id: number, osm_key: string, osm_type: string, osm_value: string, city: string, country: string, countrycode: string, county: string, district: string, name: string, postcode: string, state: string, type: string, housenumber: string, street: string, suburb: string }} Properties
     * @typedef {{ geometry: Geometry, properties: Properties, type: 'Feature' }} GeoJSON
     * @type {{features: Array.<GeoJSON>}}
     */
    const photon_features = await photon_request.json();
  
    // Por cada elemento dentro de features ...
    const features = photon_features.features.map(feature => {
      // Descomponemos el elemento en geometry y properties
      const { geometry, properties } = feature;
  
      /** Obtenemos la calle o el nombre de la caracteristica */ let title = [properties.street || properties.name];
      /** Si hay un numero de casa lo añadimos */ if (properties.housenumber != undefined) title.push(properties.housenumber);
  
      /** Unimos el titulo mediante espacios */ title = title.join(' ');
  
      /** @type {Array.<string>} Descripción de la caracteristica */ let description = [];
      /** Compobamos y añadimos el barrio o suburbio */ if (properties.suburb || properties.district) description.push(properties.suburb || properties.district);
      /** Compobamos y añadimos la ciudad */ if (properties.city) description.push(properties.city);
      /** Comprobamos el estado o el distrito */ if (properties.state || properties.state_district) description.push(properties.state || properties.state_district);
  
      /** Unimos todos los elementos de la descripción */ description = description.join(', ');
  
      /** Coordenadas de la caracteristica */ 
      const coordinates = [geometry.coordinates[1], geometry.coordinates[0]];
  
      /** Titulo compuesto (titulo, descripcion) */ const composed_title = [title, description].join(', ');
  
      return { title, description, composed_title, coordinates };
    })
  
    return features;
  }
  
  // Obtención de todos los inputs compleshon address
  const compleshon_address_list = document.querySelectorAll('.compleshon-address');
  
  // Para cada elemento dentro de compleshon_address_list ...
  for (const compleshon_addres of compleshon_address_list) {
    // Borrado de todas las sugerencias dentro del elemento compleshon 
    compleshon_addres.clear_suggestions();
    
    // Cada vez que se dispare el evento de autocompletado
    compleshon_addres.autocomplete = async (input) => { 
      delete input.dataset.coordinates;
  
      /** @type {Array.<{ title: string, description: string, composed_title: string, coordinates: [number, number] }>} Petición a photon */  
      const photon_features = await photon_suggestion(input.value, [-34.60367685025505, -58.38159853604474]);
  
      /** Estandarizamos la respuesta de photom para que sea leida por autocompleshon */
      const features = photon_features.map(feature => { return { icon: 'icon-map-pin', title: [feature.title, feature.description], dataset: { title: feature.composed_title, coordinates: feature.coordinates } } });
  
      /** Si features tiene 0 resultados cerramos las sugerencias */ if (features.length <= 0) return compleshon_addres.close_suggestions();
  
      /** Si hay sugerencias las mostramos */ compleshon_addres.replace_suggestions(...features);
    }
  
    compleshon_addres.suggestion_selected = (input, trigger) => {
      input.dataset.coordinates = trigger.dataset.coordinates;
    }
  }
}

export default compleshon_address;