class Errors {
    fatal(msg) {
        // Un error fatal por el cual la página no puede cargarse, por ejemplo
        // que no se pueda obtener el lenguaje correctamente o que la página deseada
        // no exista.
    }
    mid(msg) {
        // Un error de mediano nivel que afecta al funcionamiento de la página
        // (aunque se puede seguir ejecutando), por ejemplo un fallo de envío
        // de información al servidor
    }
    low(msg) {
        // Error de bajo nivel que no genera un malfuncionamiento de la página
        // (por lo tanto se puede seguir ejecutando), por ejemplo que haya un
        // fallo al hacer una petición de una nueva página de una lista ya
        // creada (en ese caso la página sigue siendo utilizable porque ya
        // hay otras entradas que existen, solo hubo un fallo pidiendo las nuevas)
    }
}
const error = new Errors();
export { Errors, error };
export default error;
