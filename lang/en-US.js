const lang = {
  "this": "English",
  "iso639": "en-US",

  // Globales
  "app_promotion": "Install our app. It's super lightweight and works offline!",
  "ios_app_promotion": "Install our app!",
  "ios_app_promotion_textone": "We could send notifications, it's super lightweight and works offline",
  "ios_app_promotion_texttwo": "Tap <strong>Share</strong> > <strong>Add to home screen</strong>",
  "app_update": "New version available! Update now",
  "install": "Install",
  "update": "Update",
  "retry": "Retry",
  "goback": "Go back",
  "uploading": "Uploading...",
  "actual_version": "Current version",
  "last_version": "Last version",
  "areusure": "Are you sure?",
  "imsure": "I am sure",
  "goodnews": "¡Qué buenas noticias!",
  "yesitsback": "¡Si, apareció!",
  "date": "Date",
  "written_by": "Written by",
  "information": "Information",
  "further_reading": "Further reading",
  "security": "Security",
  "clear_cache": "Clear cache",
  "success_clear_cache": "Cache has been successfully cleaned",
  "error_clear_cache": "Something went wrong cleaning cache",
  "prefer_not_to_say": "I prefer not to say",
  
  // Pagina principal
  "search_bar": "Search lost pets",
  "last_cases": "Lastest cases",
  "missing": "Missing since",

  // Pagina de información modificación y reporte
  "pet_name": "Pet name",
  "edit_pet": "Edit pet",
  "report_pet": "Report disappearance",
  "cannotedit": "Non-modifiable information",
  "general_information": "General information",
  "disappearance_date": "Disappearance date",
  "animal": "Animal",
  "pet_race": "Race",
  "animal_race": "Animal and race",
  "disappearance_place": "Disappearance place",
  "details": "Additional details",
  "contact": "Contact",
  "owner_name": "Owner",
  "owner_phone": "Phone",
  "owner_email": "Email",
  "owner_home": "Home",
  "secondary": "Secondary information",
  "reward": "Reward",
  "edit_post": "Edit your post",
  "spread_case": "Share this case",
  "not_offer": "Does not offer",
  "photos": "Photos and images",
  "report_btn": "Report",
  "send": "Send",
  "select": "Select",
  "adding_post": "We are creating your pet's post",
  "modify_info": "We are modifying your pet info",
  "modify_error": "There was an error editing the information",
  "modify_success": "Post successfully edited",
  "delete_error": "We had a problem when deleting this post",
  "delete_success": "Post successfully deleted",
  "delete_info": "When you delete your publication, you will have a period of 30 days until it is permanently deleted. We will send you an email with instructions on how to retrieve it.",
  "deleting_post": "Deleting post...",
  "finded_error": "There was a problem reporting the appearance of your pet",
  "finded_success": "Pet reported as appeared successfully",
  "finded_info": "We would be very happy to let the world know that your pet has appeared again.\n\nFirst we need you to confirm if you have already found it.",
  "finding_post": "Reporting appearance...",
  "confirm_info": "We are validating your post",
  "confirm_error": "Something went wrong when validating post",
  "confirm_success": "Post validated successfully",
  "sharingtext": {
    "twitter": "__name__ IS LOST!\n\nLast seen on __date__ at __place__. More detailed info in the link below.\n\nEvery RT helps a lot!\n",
    "whatsapp": "__name__ IS LOST!\n\nLast seen on __date__ at __place__.\n\nMore detailed info in the link below.\n"
  },
  "optional": "Optional data",
  "places_hint": "Street and number",

  "meta": {
    "description": "Spread and find out about all currently lost pets. With your help we can make each of them get back to their home!"
  },

  // Configuración
  "regional": "Regional",
  "app": "Application",
  "installapp": "Install the app",

  // Footer
  "nearby": "Near cases",
  "report": "Report new pet lost",
  "config": "Configuration",

  // Períodos de tiempo
  "periods": {
    "second": ["second", "seconds"],
    "minute": ["minute", "minutes"],
    "hour": ["hour", "hours"],
    "day": ["day", "days"],
    "week": ["week", "weeks"],
    "month": ["month", "months"],
    "year": ["year", "years"]
  },

  //Animales
  "animals": {
    "dog": "dog",
    "cat": "cat"
  },

  // Razas
  "races": {
    "dog": {
      "bulldog": "bulldog", // tiene que traermelo como estas key
      "poodle": "poodle",
      "beagle": "beagle",
      "labrador-retriver": "labrador retriver",
      "golden-retriver": "golden retriver",
      "chihuahua": "chihuahua",
      "german-shepherd": "german sheepdog",
      "siberian-husky": "siberian husky",
      "pug": "pug",
      "dalmatian": "dalmatian",
      "yorkshire-terrier": "yorkshire terrier",
      "boxer": "boxer",
      "dachshund": "dachshund"
    },
    "cat": {
      "persa": "Persa",
      "siamese": "Siamese",
      "british-shorthair": "british shorthair",
      "abyssinian": "abyssinian",
      "angora": "angora",
      "russian-blue": "russian blue",
      "bombay": "bombay",
      "birman": "birman",
      "maine-coon": "maine-coon",
      "ragdoll": "ragdoll",
      "sphynx": "sphynx"
    }
  },

  // Errores de servidor
  "error": {
    "_400": "Invalid request",
    "_404": "Page not found",
    "_406": "Validating error",
    "_500": {
      "database-error": "Database unknown error", 
      "api-error": "Internal server error", 
      "image-error": "Image processing failure"
    }
  },

  // Errores del cliente de la api
  "apiclienterror": {
    "RetryLimit": "We couldn't connect to server",
    "UndefinedRequiredData": "There are empty mandatory fields",
    "InvalidEmail": "Invalid email",
    "InvalidPhone": "Invalid phone",
    "InvalidCoordinates": "Invalid address",
    "InvalidDate": "Invalid date",
    "InvalidFile": "Invalid image format. Only JPEG or PNG images are allowed",
    "InvalidAnimal": "Invalid animal",
    "InvalidRace": "Invalid race",
    "InvalidReward": "Invalid reward",
    "DatabaseError": "There was a database error",
    "DatabaseValidationError": "There was a validation error",
    "ResourceNotFound": "Resource not found",
    "InvalidFoundState": "Invalid found state",
    "UnexpectedApiError": "Unexpected server error",
    "InvalidToken": "Invalid token",
    "InvalidCaptcha": "Something is wrong with the captcha"
  },

  // Errores de cliente
  "clienterror": {
    "connection_problem": "There was a connection problem",
    "cant_get_info": "We couldn't get the information",
    "went_wrong": "Oops! Something went wrong",
    "empty_data": "There are empty mandatory fields",
    "page_not_found": "That page doesn't exist",
    "offline": "You are offline",
    "something_wrong": "Something is bad",
    "server_fail": "Something failed in the server",
    "captcha_fail": "Something went wrong verifying captcha"
  },

  "close": "close",

  // Correos Electrónicos
  "mail": {
    "no_reply": "No Reply",
    "pet_delete": {
      "subject": "Post deleted"
    },
    "pet_add": {
      "subject": "Post created"
    }
  },

  "support_us": "Support our cause",
  "gusbone": "Give us a bone",
  "results_not_found": "We found no results",

  // Palabras o frases
  "language": "Language",

  "device_not_supported": {
    "page": {
      "title": "Device not supported",
      "text1": "We are working so that you can soon use this app.",
      "text2": "With the button below you can give us info about your device for adding support as soon as possible."
    },
    "modal1": {
      "title": "Help us sending data",
      "text": "You can send completely anonymous information about you device so we can make this work as soon as posible."
    },
    "modal2": {
      "title": "Data we process",
      "text": "When sending this information about your device we can know the system and navigator you are using. More info pressing the button below."
    },
    "modal3": {
      "title": "Sending data...",
      "text": "We are receiving and processing your data"
    },
    "modal4": {
      "title": "It's done!",
      "text": "Thank you for helping us by sending your device info. With your help, we can make that more people could use Found My Pet."
    },
    "modal5": {
      "title": "There was an error",
      "text": "We couldn't send your data"
    },
    "modal6": {
      "title": "Data already existing",
      "text": "Your device data has been sended before"
    }
  },

  "pet_success": {
    "page": {
      "title": "Post successfully created",
      "text1": "Your post is ready for everyone to know it, but first you have to do one last step: validation.",
      "text2": "For that reason, we sent you an email to __mail__. There you will find a link for doing that (with just a few taps) and another one for access directly to the pet editing.",
      "text3": "We know how you feel and be sure that we will do our best to find your pet.",
      "button": "Get back to start"
    }
  }
}