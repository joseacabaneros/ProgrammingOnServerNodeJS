var alumno = Alumno.prototype;

function Alumno(id, nombre, apellidos, genero, nacimiento){
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    if(genero === 1) this.genero = "Hombre";
    else this.genero = "Mujer";
    this.nacimiento = nacimiento;
    this.notas = [];
}

alumno.addNota = function(nota) {
    this.notas.push(nota);
}

alumno.toString = function() {
    return "<tr></tr><tr><td>" + this.id + "</td><td>" + this.nombre +
        "</td><td>" + this.apellidos + "</td><td>" + this.genero +
        "</td><td>" + this.nacimiento + "</td></tr>";
}

//Exportar modulo
module.exports = Alumno;