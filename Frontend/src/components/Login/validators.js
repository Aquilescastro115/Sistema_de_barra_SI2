//Esto es para el patron obligatorio Strategy para validaciones, no se si ya lo habian usado o no pero aqui esta xd


//Campo Obligatorio
export const isRequired = (valor) => {
    return !valor || valor.trim() === '' ? "Este campo es obligatorio" : null;
};

//Longitud minima
export const minLength = (min) => (valor) => {
    return valor.length < min ? `Debe tener al menos ${min} caracteres` : null;
};

//Sin Espacios
export const noSpaces = (valor) => {
    return valor.includes(' ') ? "No puede contener espacios" : null;
};


//Ejecutor
export const validarInput = (valor, estrategias) => {
    for (const estrategia of estrategias) {
        const error = estrategia(valor);
        if (error){
            return error;
        }
    }
    return null;
};