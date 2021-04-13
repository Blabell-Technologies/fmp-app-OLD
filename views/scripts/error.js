import alert from '/lib/dist/alerts.class.js';

window.onload = alert.fatal({
    icon: 'icon-thumb-down',
    title: lang.clienterror.page_not_found,
    buttons: [
        { text: lang.retry, action: () => location.reload() },
        { text: lang.goback, action: () => window.history.back()}
    ]
});