function Nota(id, curso, convocatoria, valor){
    this.id = id;
    this.curso = curso;
    this.convocatoria = convocatoria;
    this.valor = valor;
}

var nota = Nota.prototype;

nota.toString = function() {
    return "<tr class=\"cabecera\"><td>-----</td><td>" + this.id + 
        "</td><td>" + this.curso + "</td><td>" + this.convocatoria + 
        "</td><td>" + this.valor + "</td></tr>";
}

//Exportar modulos
module.exports = Nota;