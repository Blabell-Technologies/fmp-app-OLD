import { News } from '../../lib/data.classes.js';

let permalink = window.location.pathname.split('/');
    permalink = permalink[permalink.length - 1];

new News({get: 'single', dom: 'body', type: 'article', permalink});