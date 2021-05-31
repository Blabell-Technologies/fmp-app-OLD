var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _servers_file, _servers;
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import fetch from 'node-fetch';
class Requests {
    /** Genera una instancia de la clase Requests
     *
     * @param {object} options Opciones de inicio de requests
     * @param {string} options.servers_file Ruta del archivo de servidores
     */
    constructor(options = {}) {
        _servers_file.set(this, void 0);
        _servers.set(this, void 0);
        /** Obtencion de la ruta del archivo servers */
        __classPrivateFieldSet(this, _servers_file, options.servers_file || path.join(__dirname, '..', 'servers.json'));
        /** Obtenemos el listado de servidores del archivo servers */
        __classPrivateFieldSet(this, _servers, JSON.parse(fs.readFileSync(__classPrivateFieldGet(this, _servers_file), { encoding: 'utf8' })));
    }
    /** Compila una ruta de tipo URL
     * @param {string} url URL con sus respectivos identificadores
     * @param {Object.<string, string>} params Parametros de remplazo en la URL
     *
     * ----
     *
     * @example
     * .compile_path('/article/:id', { id: 'abc' });
     * // resultado '/article/abc'
     */
    compile_path(url, params) {
        for (const param in params) {
            const search_regexp = new RegExp(`:(${param})`, 'g');
            url = url.replace(search_regexp, params[param]);
        }
        return url;
    }
    /** Genera una ruta a un servidor
     *
     * @param {'api'|'app'} server Servidor objetivo de la URL
     * @param {object} options Opciones de conexión
     * @param {'ip'|'url'} [options.url_type=url] Tipo de url para generar
     * @param {object} options.parameters Modifica la URL en base a parametros
     * @param {string[]|string} options.parameters.saved_paths Nombres de las rutas guardadas a usar
     * @param {string[]} options.parameters.parameters Parametros a usar en la URL
     * @param {Object.<string, string>} options.parameters.wildcard_parameters Objeto de remplazo para los parametros comodin
     * @param {Object.<string, string>} options.querys Añade querys de consulta a la URL
     *
     * ----
     *
     * @example
     * .generate_url('api', { parameters: { saved_paths: ['pets', 'single'], wildcard_parameters: { id: abc } } });
     * // resultado https://api.foundmypet.org/pets/single/abc
     * .generate_url('api', { url_type: 'ip' parameters: { saved_paths: ['pets'], parameters: ['single', ':id'], wildcard_parameters: { id: abc } } });
     * // resultado http://localhost:3000/pets/single/abc
     */
    generate_url(server, options = {}) {
        const url_type = options.url_type || 'url';
        // Selección del servidor a usar
        const selected_server = __classPrivateFieldGet(this, _servers)[server];
        // Selección del tipo de url a usar
        const selected_url = selected_server[url_type];
        // Se juntan el protocolo la url y el puerto para formar la url
        let url = `${selected_url.protocol}://${selected_url.url}`;
        // @ts-ignore En caso de haber puerto se añade
        if (selected_url.port != undefined)
            url += `:${selected_url.port}`;
        let composed_path = '';
        if (options.parameters != undefined) {
            // Guardado de los elementos de parametros
            const saved_paths = options.parameters.saved_paths || '';
            const passed_paths = options.parameters.parameters || [];
            const wildcard_parameters = options.parameters.wildcard_parameters || [];
            let paths = [];
            //#region Gestion de rutas guardadas
            // En caso de establecerse un tipo de ruta guardada y si el servidor no tiene ninguna, se retorna un error
            if (saved_paths != '' && selected_server.paths == undefined)
                throw Error('No saved routes found');
            // En caso de que sea un array de rutas guardadas se busca el valor de esa ruta
            if (typeof saved_paths == 'object')
                saved_paths.map(path => { paths.push(selected_server.paths[path]); });
            // En caso de ser un string se busca su coincidencia en los paths
            if (typeof saved_paths == 'string')
                paths.push(selected_server.paths[saved_paths]);
            //#endregion
            // En caso de haber rutas como parametros, se añaden al path
            if (passed_paths.length >= 0)
                passed_paths.map(path => { paths.push(path); });
            // Se filtra el array para borrar indefinidos
            paths = paths.filter(parameter => parameter != undefined);
            // Una vez terminado se una todo el path
            composed_path = paths.join('/');
            // Se compila la url con los comodines de rutas
            composed_path = this.compile_path(composed_path, wildcard_parameters);
        }
        /* Se junta la url y los parametros, se compone en un objeto url */
        const composed_url = new URL([url, composed_path].join('/'));
        if (options.querys != undefined) {
            for (const query_key in options.querys) {
                const query_value = options.querys[query_key];
                composed_url.searchParams.append(query_key, query_value);
            }
        }
        // Retornamos la url compuesta
        return composed_url;
    }
    /** Genera una petición HTTP y devuelve el cuerpo de lo recibido
     *
     * @param {string|URL} url URL de la peticion
     * @param {object} options Opciones de petición
     * @param {number} [options.timeout=3000] Tiempo maximo de espera para que termine la petición
     * @param {number} [options.timeout_retry_limit=3] Especifica el limite maximo de reintentos de petición
     * @param {'GET'|'POST'|'PUT'|'DELETE'} [options.method=GET] Metodo HTTP por el que se ralizara la petición
     * @param {BodyInit} options.body Cuerpo de la petición HTTP
     * @param {HeaderInit} options.headers Cabecera del la peticion HTTP
     *
     * ----
     * @example
     * .fetch('https://api.foundmypet.org/pets', { timeout_retry_limit: 5 });
     */
    async fetch(url, options = {}) {
        const timeout = options.timeout || 3000;
        const timeout_retry_limit = options.timeout_retry_limit || 3;
        const method = options.method || 'GET';
        const body = options.body || undefined;
        const headers = options.headers || undefined;
        let curret_retrys = 0;
        async function try_fetch() {
            curret_retrys++; // Se suma un intento
            try {
                // Se realiza la peticion a la url con los parametros establecidos
                var fetched_data = await fetch(url, { timeout, method, body, headers });
                // 
                var fetched_body = await fetched_data.json();
            }
            catch (err) {
                // En caso de que la peticion falle por tiempo de espera ...
                if (err.type == 'request-timeout') {
                    // Si el limite de reintentos no fue superado, se realiza otra petición
                    if (curret_retrys < timeout_retry_limit)
                        try_fetch();
                    // En caso contrario, retorna un error por limite exedido
                    else
                        throw Error('Retry limit exceeded');
                }
                throw err;
            }
            return { conncetion: fetched_data, try_count: curret_retrys, body: fetched_body };
        }
        return await try_fetch();
    }
    get get_servers() { return __classPrivateFieldGet(this, _servers); }
}
_servers_file = new WeakMap(), _servers = new WeakMap();
const requests = new Requests();
// Exportación de la funcion requests (clase iniciada) y la calse Requests
export { Requests, requests };
// La exportación por defecto es de la funcion requests
export default requests;
