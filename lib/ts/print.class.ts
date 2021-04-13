import colors from "colors";
import dayjs from "dayjs";

import path from 'path';
import fs from 'fs';

interface IConstructor {
	log_path?: string,
	log_name_format?: string,
}

class Print {
	#log_path: string; #log_format: string;

  /** Genera una nueve instancia de print
   *
   * @param {object} opts Opciones de configuración del print
   * @param {string} opts.log_path Carptea donde se guardaran los logs
   * @param {string} opts.log_name_format Formato del nombre de guardado del log
	 * 
   */
  public constructor(opts: IConstructor = {}) {
		this.#log_path = opts.log_path || path.join(process.env.dirname, 'logs');
		this.#log_format = opts.log_name_format || 'YYYY-MM-DD';

		if (!fs.existsSync(this.#log_path)) fs.mkdirSync(this.#log_path);

		if (!this.#log_format.includes('YYYY') || !this.#log_format.includes('MM') || !this.#log_format.includes('DD')) throw TypeError('Invalid log format');
		console.log();
	}

	public save_log() {
		if (!fs.existsSync(path.join(this.#log_path, this.active_log))) fs.appendFileSync(path.join(this.#log_path, this.active_log), 'Hello My friend' + '\n');
	}

	/** Retorna el nombre del log activo */
	public get active_log(): string { return dayjs().format(this.#log_format) + '.log'; };
	/** Retorna el path donde se alojan actualmente los archivos log */
	public get active_path(): string { return this.#log_path; };
	/** Retorna el formato de guardado del path */
	public get get_active_format(): string { return this.#log_format; };
}	

const nprint = new Print();
nprint.save_log();
nprint.save_log();
nprint.save_log();