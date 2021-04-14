const lang = {
  "this": "Español",

  // Globales
  "app_promotion": "Instalá nuestra app. ¡Es super ligera y funciona sin conexión!",
  "ios_app_promotion": "¡Instalá la app!",
  "ios_app_promotion_textone": "Podrás recibir notificaciones, es súper ligera y funciona sin conexión",
  "ios_app_promotion_texttwo": "Tocá en <strong>Compartir</strong> > <strong>Agregar a inicio</strong>",
  "app_update": "¡Nueva versión disponible! Actualizá ahora",
  "install": "Instalar",
  "update": "Actualizar",
  "retry": "Reintentar",
  "goback": "Volver",
  "uploading": "Subiendo...",
  "actual_version": "Versión actual",
  "last_version": "Última versión",
  "areusure": "Estás seguro?",
  "imsure": "Estoy seguro",
  "goodnews": "¡Qué buenas noticias!",
  "yesitsback": "¡Si, apareció!",
  "date": "Fecha",
  "written_by": "Escrito por",
  "information": "Información",
  "further_reading": "Conocé más",
  "security": "Seguridad",

  // Pagina principal
  "search_bar": "Buscá mascotas perdidas",
  "last_cases": "Últimos casos",
  "missing": "Se perdió hace",

  // Pagina de información modificación y reporte
  "pet_name": "Nombre de la mascota",
  "edit_pet": "Editar mascota",
  "report_pet": "Reportar desaparición",
  "cannotedit": "Información no modificable",
  "general_information": "Información general",
  "disappearance_date": "Fecha de desaparición",
  "animal": "Animal",
  "pet_race": "Raza",
  "animal_race": "Animal y raza",
  "disappearance_place": "Lugar de desaparición",
  "details": "Datos adicionales",
  "contact": "Contacto",
  "owner_name": "Dueño",
  "owner_phone": "Teléfono",
  "owner_email": "Correo",
  "owner_home": "Domicilio",
  "secondary": "Información secundaria",
  "reward": "Recompensa",
  "edit_post": "Editá tu publicación",
  "spread_case": "Difundí este caso",
  "not_offer": "No ofrece",
  "photos": "Fotos e imágenes",
  "report_btn": "Reportar",
  "send": "Enviar",
  "select": "Seleccioná",
  "adding_post": "Estamos creando la publicación de tu mascota",
  "modify_info": "Estamos modificando la publicación de tu mascota",
  "modify_error": "Hubo un error editando la mascota",
  "modify_success": "Publicación modificada correctamente",
  "delete_error": "Hubo un error borrando la publicación",
  "delete_success": "La publicación se borró correctamente",
  "delete_info": "Al eliminar tu publicación tendrás un plazo de 30 dias hasta que se borre permanentemente. Te enviaremos un correo electrónico con las instrucciones de cómo recuperarla.",
  "deleting_post": "Eliminando publicación...",
  "finded_error": "Hubo un error reportando la aparición",
  "finded_success": "Se marcó como aparecida correctamente",
  "finded_info": "Estaríamos muy felices de contarle al mundo que tu mascota apareció nuevamente.\n\nNecesitamos que confirmes si ya la encontraste.",
  "finding_post": "Reportando aparición...",
  "confirm_info": "Confirmando publicación...",
  "confirm_error": "Hubo un error confirmando la publicación",
  "confirm_success": "La publicación se validó correctamente",
  "sharingtext": {
    "twitter": "¡SE PERDIÓ __name__!\n\nVisto por última vez el __date__ en __place__. Mira información más detallada en el link de abajo.\n\n¡Cada RT es de gran ayuda!\n",
    "whatsapp": "¡SE PERDIÓ __name__!\n\nVisto por última vez el __date__ en __place__.\n\nMira información más detallada en el link de abajo.\n"
  },
  "optional": "Dato opcional",
  "places_hint": "Calle y altura",

  "meta": {
    "description": "Difundí y enterate de todas las mascotas perdidas actualmente. ¡Con tuayuda vamos a lograr que cada una de ellas pueda regresar a su hogar!"
  },
  
  // Configuración
  "regional": "Regional",
  "app": "Aplicación",
  "installapp": "Instala la app",

  // Footer
  "nearby": "Casos cercanos",
  "report": "Reportar mascota perdida",
  "config": "Configuración",
  
  // Períodos de tiempo
  "periods": {
    "second": ["segundo", "segundos"],
    "minute": ["minuto", "minutos"],
    "hour": ["hora", "horas"],
    "day": ["día", "días"],
    "week": ["semana", "semanas"],
    "month": ["mes", "meses"],
    "year": ["año", "años"]
  },

  //Animales
  "animals": {
    "dog": "perro",
    "cat": "gato"
  },

  // Razas
  "races": {
    "dog": {
      "bulldog": "bulldog",
      "poodle": "poodle",
      "beagle": "beagle",
      "labrador-retriver": "labrador",
      "golden-retriver": "golden",
      "chihuahua": "chihuahua",
      "german-shepherd": "ovejero alemán",
      "siberian-husky": "husky siberiano",
      "pug": "pug",
      "dalmatian": "dálmata",
      "yorkshire-terrier": "yorkshire terrier",
      "boxer": "bóxer",
      "dachshund": "salchicha"
    },
    "cat": {
      "persa": "persa",
      "siamese": "siamés",
      "british-shorthair": "británico",
      "abyssinian": "abisinio",
      "angora": "angora",
      "russian-blue": "azul ruso",
      "bombay": "bombay",
      "birman": "birmano",
      "maine-coon": "maine coon",
      "ragdoll": "ragdoll",
      "sphynx": "esfinge"
    }
  },

  // Errores de servidor
  "error": {
    "_400": "La petición es invalida",
    "_404": "Página no encontrada",
    "_406": "Fallo en la validación",
    "_500": {
      "database-error": "Error desconocido en la base de datos", 
      "api-error": "Error interno del servidor", 
      "image-error": "Fallo al convertir la(s) imágen(es)"
    }
  },
  
  // Errores del cliente de la api
  "apiclienterror": {
    "RetryLimit": "No pudimos conectar al servidor",
    "UndefinedRequiredData": "Hay datos obligatorios vacíos",
    "InvalidEmail": "Correo inválido",
    "InvalidPhone": "Teléfono inválido",
    "InvalidCoordinates": "Dirección inválida",
    "InvalidDate": "Fecha inválida",
    "InvalidFile": "Formato de imágenes incorrecto. Solo se permiten JPEG o PNG",
    "InvalidAnimal": "Animal inválido",
    "InvalidRace": "Raza inválida",
    "InvalidReward": "Recompensa inválida",
    "DatabaseError": "Hubo un error con la base de datos",
    "DatabaseValidationError": "Hubo un error de validación",
    "ResourceNotFound": "Recurso no encontrado",
    "InvalidFoundState": "Estado encontrado inválido",
    "UnexpectedApiError": "Hubo un error inesperado del servidor",
    "InvalidToken": "Token inválido",
    "InvalidCaptcha": "Hay algo mal con el captcha"
  },

  // Errores de cliente
  "clienterror": {
    "connection_problem": "Hubo un problema de conexión",
    "cant_get_info": "No pudimos obtener la información",
    "went_wrong": "¡Ups! Algo salió mal",
    "empty_data": "Hay campos obligatorios vacíos",
    "page_not_found": "Esta página no existe",
    "offline": "Estás desconectado",
    "something_wrong": "Hay algo mal",
    "server_fail": "Algo falló en el servidor",
    "captcha_fail": "Hubo un error verificando el captcha"
  },

  "close": "cerrar",

  // Correos Electrónicos
  "mail": {
    "no_reply": "No responder",
    "pet_delete": {
      "subject": "Publicación borrada"
    },
    "pet_add": {
      "subject": "Publicación creada"
    }
  },

  "support_us": "Apoya nuestra causa",
  "gusbone": "Regalanos un huesito",
  "results_not_found": "No encontramos resultados",

  // Palabras o frases
  "language": "Idioma",

  // Página de dispositivos no soportados
  "device_not_supported": {
    "page": {
      "title": "Dispositivo no soportado",
      "text1": "Estamos trabajando para que pronto puedas usar la app desde aquí",
      "text2":  "Con el botón de abajo podrás darnos información sobre tu dispositivo para añdir soporte lo antes posible"
    },
    "modal1": {
      "title": "Ayudanos enviando información",
      "text": "Podés enviarnos datos sobre tu dispositivo de forma completamente anonima para que podamos añadir compatibilidad lo antes posible"
    },
    "modal2": {
      "title": "Datos que procesamos",
      "text": "Al enviar la información sobre tu dispositivo estás dando a conocer tu sistema operativo y el navegador que estás usando.\n\nPodés conocer más en el botón de abajo"
    },
    "modal3": {
      "title": "Enviando datos...",
      "text": "Estamos recibiendo y procesando tu información"
    },
    "modal4": {
      "title": "¡Ya está!",
      "text": "Gracias por ayudarnos enviando la información de tu dispositivo.\n\nCon tu ayuda, proximamente muchas más personas podrán usar Found My Pet"
    },
    "modal5": {
      "title": "Hubo un error",
      "text": "Hubo un error y no pudimos enviar la información"
    },
    "modal6": {
      "title": "Información existente",
      "text": "Los datos de tu dispositivo ya fueron enviados previamente"
    }
  },

  "pet_success": {
    "page": {
      "title": "Publicación exitosa",
      "text1": "Tu publicación está lista para que todos la vean, pero antes hay un último paso: confirmarla.",
      "text2": "Para eso, te enviamos un correo a __mail__ en donde encontrarás el enlace para hacerlo (con unos pocos clicks ya está). También allá tendrás un acceso directo para editar tu publicación todas las veces que sea necesario.",
      "text3": "Entendemos tu angustia y queremos que sepas que haremos todo lo posible por encontrar a tu mascota.",
      "button": "Volver al inicio"
    }
  }
}