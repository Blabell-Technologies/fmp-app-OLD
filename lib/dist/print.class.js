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
var _log_path, _log_format;
import dayjs from "dayjs";
import path from 'path';
import fs from 'fs';
class Print {
    /** Genera una nueve instancia de print
     *
     * @param {object} opts Opciones de configuración del print
     * @param {string} opts.log_path Carptea donde se guardaran los logs
     * @param {string} opts.log_name_format Formato del nombre de guardado del log
       *
     */
    constructor(opts = {}) {
        _log_path.set(this, void 0);
        _log_format.set(this, void 0);
        __classPrivateFieldSet(this, _log_path, opts.log_path || path.join(process.env.dirname, 'logs'));
        __classPrivateFieldSet(this, _log_format, opts.log_name_format || 'YYYY-MM-DD');
        if (!fs.existsSync(__classPrivateFieldGet(this, _log_path)))
            fs.mkdirSync(__classPrivateFieldGet(this, _log_path));
        if (!__classPrivateFieldGet(this, _log_format).includes('YYYY') || !__classPrivateFieldGet(this, _log_format).includes('MM') || !__classPrivateFieldGet(this, _log_format).includes('DD'))
            throw TypeError('Invalid log format');
        console.log();
    }
    save_log() {
        if (!fs.existsSync(path.join(__classPrivateFieldGet(this, _log_path), this.active_log)))
            fs.appendFileSync(path.join(__classPrivateFieldGet(this, _log_path), this.active_log), 'Hello My friend' + '\n');
    }
    /** Retorna el nombre del log activo */
    get active_log() { return dayjs().format(__classPrivateFieldGet(this, _log_format)) + '.log'; }
    ;
    /** Retorna el path donde se alojan actualmente los archivos log */
    get active_path() { return __classPrivateFieldGet(this, _log_path); }
    ;
    /** Retorna el formato de guardado del path */
    get get_active_format() { return __classPrivateFieldGet(this, _log_format); }
    ;
}
_log_path = new WeakMap(), _log_format = new WeakMap();
const nprint = new Print();
nprint.save_log();
nprint.save_log();
nprint.save_log();
