const assert = require('assert');
const consulta = require("../consulta.js");
const estadisticas = require("../estadisticas.js");

//TODAS LAS PRUEBAS DEBEN EJECUTARSE CON TODOS LOS ARCHIVOS JSON
//DE LAS NOTAS SUBIDOS(LOS ARCHIVOS PROPORCIONADOS PARA LA PRACTICA)
describe('método cruzarDatos()', function(){
    alumnos = consulta.cruzarDatos();
    it('Número de personas - 200', function(){
        assert.equal(200, alumnos.length);
    });
    it('Número de notas de un estudiante - 3', function(){
        assert.equal(3, alumnos[14].notas.length);
    });
    it('Valor de la primera nota de un estudiante - 4.6', function(){
        assert.equal(4.6, alumnos[14].notas[0].valor);
    });
    it('Genero de un estudiante - Mujer', function(){
        assert.equal("Mujer", alumnos[17].genero);
    });
    it('Valor de una nota de un estudiante - NP', function(){
        assert.equal("NP", alumnos[152].notas[1].valor);
    });
    it('Número de notas de una personas - 0', function(){
        assert.equal(0, alumnos[100].notas.length);
    });
    it('Asignatura de una nota de un estudiante - C2', function(){
        assert.equal("C2", alumnos[68].notas[0].id);
    });
    it('Apellidos de un estudiante - SANTIAGO MOLINA', function(){
        assert.equal("SANTIAGO MOLINA", alumnos[119].apellidos);
    });
    it('ID de un estudiante - ID0068', function(){
        assert.equal("ID0068", alumnos[68].id);
    });
    it('Nombre de un estudiante - JOSE ANTONIO', function(){
        assert.equal("JOSE ANTONIO", alumnos[129].nombre);
    });
    it('Fecha de nacimiento de un estudiante - 22-07-1973', function(){
        assert.equal("22-07-1973", alumnos[148].nacimiento);
    });
    it('Curso de una asignatura de un estudiante - 2015-16', function(){
        assert.equal("2015-16", alumnos[148].notas[0].curso);
    });
    it('Convocatoria de una asignatura de un estudiante - 3', function(){
        assert.equal(3, alumnos[160].notas[2].convocatoria);
    });
    it('Notas de una personas no estudiante - 0', function(){
        assert.equal(0, alumnos[199].notas.length);
    });
    it('Nota de una personas no estudiante - undefined', function(){
        assert.equal(undefined, alumnos[199].notas[0]);
    });
});