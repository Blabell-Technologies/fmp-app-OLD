import alert from '/lib/dist/alerts.class.js';

window.addEventListener('load', async () => {
  let edit_id = window.location.pathname.split('/');
      edit_id = edit_id[edit_id.length - 1];

  try {
    let url = new URL(window.location.origin + '/api/pets/confirm/' + edit_id);
    let request = await fetch(url, { method: 'PUT' });
        request = await request.json();

    if (request.eps != 'insider') throw request;

    alert.info({
      title: lang.confirm_success,
      icon: 'icon-heart',
      buttons: [
        { text: lang.goback, type: 'primary', action: () => window.location.href = window.location.origin }
      ]
    });

  } catch (error) {
    console.error(error);
    alert.fatal({
      icon: 'icon-thumb-down',
      title: lang.confirm_error,
      buttons: [
        { text: lang.retry, action: () => window.location.reload() }
      ]
    });
  }
})