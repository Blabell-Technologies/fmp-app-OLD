
//#region Importado de nodemodules

  const fs = require('fs');
  const { Router, json } = require('express');
  const FMP = require('fmp-client');
  const formidable = require('express-formidable');
  const fetch = require('node-fetch');
  const cors = require('cors');

//#endregion

//#region Importado de módulos por directorio

  const mail = require('../mail/transporter');
  const print = require('../../lib/logger.class.lib');
  const compiler = require('../mail/templates/compiler');
  const { get_dictionary } = require('../../lib/lang.lib');
  const { connection } = require('../db/connection');
  const { Info } = require('../db/model');

//#endregion

//#region Creación de router, configuración y conexión con la db

  const router = Router();
  const fmp = new FMP('B2wmZLREFsk2c11');
  connection();

  // Headers de cada petición proveniente de aquí
  router.use('/*', (req, res, next) => {
    res.set({
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.removeHeader('X-Powered-By');
    next();
  });

//#endregion

//#region Versiones

  router.get('/version', (req, res) => {
    let pkg = fs.readFileSync(process.env.dirname + '/package.json', { encoding: 'utf-8' });
    pkg = JSON.parse(pkg);
    res.send({ version: pkg.version });
  });

//#endregion

//#region Gestor de mascotas

  // Mascotas cercanas a tu ubicación
  router.get('/pets/nearby', async (req, res) => {
    try {  var result = await fmp.pets.nearby(req.query); return res.json(result); }
    catch (err) { print.error(err); return res.json(err); }
  });

  // Busqueda de mascotas
  router.get('/pets/search', async (req, res) => {
    try { var result = await fmp.pets.search(req.query.q, {limit: req.query.limit || null, page: req.query.page || 1}); return res.json(result); }
    catch (err) { print.error(err); return res.json(err) }
  });

  // Post de una mascota
  router.get('/pets/post/:id', async (req, res) => {
    try { var result = await fmp.pets.view(req.params.id, req.query); return res.json(result); }
    catch (err) { print.error(err); return res.status(500).json(err) }
  });

  // Post de una mascota con información selectiva
  router.get('/pets/exp/post/:id', async (req, res) => {
    try {

      // Generación de url para pedir los datos personalizados
      let url = new URL(`${process.env.API_SERVER}pets/insider/post/${req.params.id}`);

      // En caso de que existan includes o excludes los añade
      if (req.query.include != undefined) url.searchParams.append('include', req.query.include.join(','));
      if (req.query.exclude != undefined) url.searchParams.append('exclude', req.query.exclude.join(','));

      // Solicita la información
      var result = await fetch(url, { headers: { 'access-token': 'B2wmZLREFsk2c11' } });
      if (result.status == 502) return res.status(500).json({ kind: 'api-error', description: 'Impossible to connect to API' });
          result = await result.json();

      // La devuelve
      return res.json(result);
    } catch (err) { print.error(err); return res.status(err.status || 500).json(err); }
  });

  // Reportar nueva mascota
  router.post('/pets/add', formidable({ multiples: true, maxFileSize: 10*1024*1024, keepExtensions: true }), async (req, res) => {
    // Combinar los archivos y las entradas en una sola variable
    const body = {...req.files, ...req.fields};

    try {
      const result = await fmp.pets.add(body);
      if ((result instanceof Error) == false) {
        const lang = await get_dictionary(req.cookies.lang);
        const config = {
          from: {
            name: lang.mail.no_reply + ' - FoundMyPet 🐾',
            address: process.env['EMAIL.USER']
          },
          to: body.owner_email,
          subject: lang.mail.pet_add.subject,
          html: compiler(`pet_add/${req.cookies.lang}`, { owner_name: body.owner_name, pet_name: body.pet_name, edit_id: result.edit_id }),
          attachments: [
            { filename: 'fmp_headerimg.png', path: process.cwd() + '/views/assets/img/logos/fmp_logo_vertical.jpg', cid: 'fmp_headerimg' }
          ]
        }

        mail.sendMail(config)
          .then((email) => print.info(`Email successfully sended to ${body.owner_email} for creating a new post`))
          .catch((err) => { print.error(`Error sending mail to ${body.owner_email} while creating a new post.\n${err}`); });
        
        return res.json(result);
      }
    } catch (err) {
      print.error(err);
      return res.json(err);
    }
  });

  // Confirmar la publicación de un post
  router.put('/pets/confirm/:uuid', async (req, res) => {
    try {
      let url = new URL(`${process.env.API_SERVER}pets/insider/verify/${req.params.uuid}`);
      const request = await fetch(url, { method: 'PUT', headers: { 'access-token': 'B2wmZLREFsk2c11' } });
      const decoded = await request.json();
      if (!request.ok) return res.status(request.status).json(decoded);
      return res.json(decoded);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });

  // Modificar un post
  router.put('/pets/modify/:id', formidable({ multiples: true }), async (req, res) => {
    const body = {...req.files, ...req.fields};
    try { var result = await fmp.pets.edit(req.params.id, body); return res.json(result); }
    catch (err) { print.error(err); return res.json(err) }
  });

  // Eliminar un post
  router.delete('/pets/delete/:uuid', async (req, res) => {
    try {
      const result = await fmp.pets.delete(req.params.uuid);
      if ((result instanceof Error) == false) {
        const lang = await get_dictionary(req.cookies.lang);
        const config = {
          from: {
            name: lang.mail.no_reply + ' - FoundMyPet 🐾',
            address: process.env['EMAIL.USER']
          },
          to: req.query.mail,
          subject: lang.mail.pet_delete.subject,
          html: compiler(`pet_delete/${req.cookies.lang}`, { owner_name: req.query.owner, pet_name: req.query.pet_name }),
          attachments: [
            { filename: 'fmp_headerimg.png', path: process.cwd() + '/views/assets/img/logos/fmp_logo_vertical.jpg', cid: 'fmp_headerimg' }
          ]
        }

        mail.sendMail(config)
          .then((email) => print.info(`Email successfully sended to ${req.query.mail} for deleting a post`))
          .catch((err) => { print.error(`Error sending mail to ${req.query.mail} while deleting a post.\n${err}`); });
        
      return res.json(result);
      }
    }
    catch (err) {
      print.error(err);
      return res.json(err);
    }
  });
//#endregion

//#region Gestor de animales
  // Obtener todos los animales
  router.get('/animals/get', async (req, res) => {
    try { var result = await fmp.animals.get(); return res.json(result); }
    catch (err) { console.error('[FMP Client] =>', err); return res.status(500).json(err) }
  });

  // Verificar animal
  router.get('/animals/verify/:animal', async (req, res) => {
    try { var result = await fmp.animals.check(req.params.animal); return res.json(result); }
    catch (err) { return res.json(err) }
  });

  // Obtener todas las razas de un animal
  router.get('/races/get/:animal', async (req, res) => {
    try { var result = await fmp.animals.get(req.params.animal); return res.json(result); }
    catch (err) { return res.json(err) }
  });

  // Verificar una raza de un animal
  router.get('/races/verify/:animal/:race', async (req, res) => {
    try { var result = await fmp.animals.check(req.params.animal, req.params.race); return res.json(result); }
    catch (err) { return res.json(err) }
  });
//#endregion

//#region Gestor de notificaciones push

  router.post('/dns', (req, res) => {
    fs.appendFileSync(__dirname + '/../logs/devices.log.json', JSON.stringify(req.body.navigator, null, 2) + '\n');
    print.info(`A new not-supported device has sended information`);
    return res.status(200).send();
  })

  // Importado de notificaciónes push
  const webpush = require('../notifications/webpush');
  let pushSubscription = [];

  const auths = process.env.API_AUTHS.split(',');

  const api_auth = (req, res, next) => {
    if (!auths.includes(req.query.aid)) return res.status(401).send('Unauthorized');
    next();
  }

  router.post('/notifications/subscription', async (req, res) => {

    const found = await pushSubscription.find(elem => elem.endpoint == req.body.endpoint);
    
    if (found != undefined) { return res.status(304).send('Device already registered'); }
    
    try { pushSubscription.push(req.body); }
    catch (e) { console.error(e); return res.status(500).send(e) }
    res.status(200).json();
  });

  router.get('/notifications/push', api_auth, async (req, res) => {
    const message = req.query.msg || 'Message';
    const title = req.query.title || 'Found My Pet';

    const payload = JSON.stringify({ title, message });

    let i = 0;
    for (const subscriber of pushSubscription) {
      try { await webpush.sendNotification(subscriber, payload); }
      catch (e) { console.error(e); }

      i++;
    }

    res.send(pushSubscription || { undefined });
  });

  router.get('/notifications/devices', api_auth, async (req, res) => {
    res.send(pushSubscription || 'EMPTY');
  });

//#endregion

//#region Gestor de noticias

  // Noticias e información desplegable en la app
  router.get('/news/random', async (req, res) => {
    let result;
    
    try { 
      result = await Info.aggregate([{ $match: { lang: req.query.lang, permalink: { $ne: req.query.avoid } } }, { $sample: { size: req.query.size || 3 } }]);
      if (result != undefined && result.length > 0) return res.send(result);
    } catch(error) {
      print.error(error);
      return res.status(500).send(error);
    }
    return res.json({ empty: true });
  });

  router.get('/news/last', async (req, res) => {
    Info.paginate({ lang: req.query.lang || 'es-ES' }, { sort: { createdAt: -1 }, limit: 1, page: req.query.back + 1 || 1 }, (error, result) => {
      if (error) {
        print.error(error);
        return res.status(500).send(error);
      }
      if (result.docs[0] != undefined) return res.send(result.docs[0]);
      return res.send({ empty: true });
    });
  });

  router.get('/news/period', async (req, res) => {
    const since = new Date(req.query.since);
    const until = new Date(req.query.until);
    Info.find({ lang: req.query.lang || 'es-ES', createdAt: {$gt: until, $lt: since} }, {}, { sort: { createdAt: -1 } }, (error, result) => {
      if (error) {
        print.error(error);
        return res.status(500).send(error);
      }
      if (result.length > 0) return res.send(result);
      return res.send({ empty: true });
    })
  });

  router.get('/news/single/:permalink', async (req, res) => {
    Info.findOne({ lang: req.query.lang || 'es-ES', permalink: req.params.permalink }, {}, (error, result) => {
      if (error) {
        print.error(error);
        return res.status(500).send(error);
      }
      if (result == undefined) return res.status(404).send();
      return res.send(result);
    });
  });

  router.post('/news/add', api_auth, json(), cors(), async (req, res) => {

    if (await Info.exists({ $and: [{ permalink: req.body.permalink }, { lang: req.body.lang }] })) return res.send('that news already exists');
    
    let data = new Info(req.body);

    try {
      await data.save();
    } catch (error) {
      print.error(error);
      return res.status(500).send(error);
    }

    return res.send('news added successfully');
  });

//#endregion

//#region Captchas y verificaciones

  router.get('/captcha/verify', async (req, res) => {
    const secret_key = '0xDeE663a4aE49e980B143aE88A7DEE7ED44903eC4';
    const hcaptcha_response = req.query.hcaptcha_response || null;

    if (hcaptcha_response == null) return res.status(500).json({ kind: 'captcha-response-null', description: 'Captcha response value was expected but not found' });
    
    try {
      const data = `response=${hcaptcha_response}&secret=${secret_key}`;
  
      let request = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST', 
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: data
      });
      request = await request.json();
  
      return res.json(request);
    } catch(err) { print.error(err); return res.json(err) }
  });

//#endregion


module.exports = router;
