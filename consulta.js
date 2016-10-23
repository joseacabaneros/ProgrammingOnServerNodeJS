const formidable = require('formidable'), fs = require('fs');
const folder = 'tmp/';

var Alumno = require("./alumno.js");
var Nota = require("./nota.js");
var Global = require("./global.js");

var alumnos;
var num_personas;

//METODOS DE LA PARTE DE CONSULTA DE NOTAS
exports.consultaGet = function(request, response){
    Global.writeHead(response);
    writeBodyConsulta(response);
    this.cruzarDatos();
    printListadoEstudiantes(response);
    response.write("</div>");
    Global.writeFooter(response);
}

exports.consultaPost = function(request, response){
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
        Global.writeHead(response);
        writeBodyConsulta(response);

        var id_estudiante = fields.estudiante;
        var curso = fields.curso;
        var asignatura = fields.asignatura;

        //console.log(id_estudiante);
        //console.log(curso);
        //console.log(asignatura);

        if(id_estudiante !== "")
            filtrarEstudiante(id_estudiante, response);
        else if(curso !== "")
            filtrarCurso(curso, response);
        else if(asignatura !== "")
            filtrarAsignatura(asignatura, response);
        else
            printListadoEstudiantes(response);

        response.write("</div>");
        Global.writeFooter(response);
    });
}

function writeBodyConsulta(response){
    response.write("<header><a href='/' class='button'><span>Atrás</span></a>" + 
                   "<h2>Sistema de información de notas de cursos - CONSULTAR NOTAS</h2>" + 
                   "<h3>NodeJS - JavaScript</h3></header>");
    response.write("<div class='padding'><form action=\"/consulta\" method=\"POST\" enctype=\"multipart/form-data\">" + 
                        "<label>ID estudiante:<input type=\"text\" name=\"estudiante\" placeholder=\"ID0050\"></label>" + 
                        "<label>Curso: <input type=\"text\" name=\"curso\" placeholder=\"2014-15\"></label>" + 
                        "<label>Asignatura: <input type=\"text\" name=\"asignatura\" placeholder=\"C1\"></label>" + 
                        "<input type=\"submit\" value=\"Buscar\" name=\"buscar\" class=\"button\">" +
                   "</form>");
}


//METODOS DE FUNCIONALIDAD
//CONSULTA
exports.cruzarDatos = function(){
    var json = JSON.parse(fs.readFileSync('resources/personas.json','utf8'));
    num_personas = 0;
    alumnos = [];
        
    //Creacion de todas las personas del JSON
    num_personas = json['total'];
    var pers = json['personas'];
    pers.forEach(function(persona){
        alumnos.push(new Alumno(persona.id, persona.nombre, persona.apellidos, 
                                persona.genero, persona.fechaNacimiento));
    });
    
    //Cruzar notas de los ficheros JSON con las personas cargadas anteriormente
    var ficheros = fs.readdirSync(folder);
    for(var i in ficheros){
        var json = JSON.parse(fs.readFileSync(folder + ficheros[i],'utf8'));
        
        var id = json['id'];
        var curso = json['curso'];
        var conv = json['convocatoria'];
        
        json['notas'].forEach(function(nota){
            var nt = new Nota(id, curso, conv, nota.valor);
            //SOLO RECORREMOS LAS PERSONAS HASTA ENCONTRAR A LA QUE CORRESPONDE DICHA NOTA
            alumnos.some(function(alu){
               if(alu.id === nota.id){
                    alu.addNota(nt);
                    return;
               }
            });
        });
    }
    //console.log(alumnos[10].notas[2].toString());
    return alumnos;
}

function numestudiantes(){
    var num_estudiantes = 0;
    
    alumnos.forEach(function(alumno){
        if(alumno.notas.length > 0)
            num_estudiantes++;
    });
    
    return num_estudiantes;
}

function printListadoEstudiantes(response){
    var cabecera = true;
    
    response.write("<h1>Número total de estudiantes: " + numestudiantes() + " (de las " + num_personas +  " personas)</h1>");
    
    alumnos.forEach(function(alumno){
        var primera = true;
        alumno.notas.forEach(function(nota){
            if(cabecera){
                response.write("<table><tr class=\"cab\"><th>ID</th><th>NOMBRE</th><th>APELLIDOS</th><th>GENERO</th><th>F.NACIMIENTO</th></tr>");
                cabecera = false;
            }
            if(primera){
                response.write(alumno.toString());
                response.write("<tr class=\"cabnotas\"><th>-----</th><th>ASIGNATURA</th><th>CURSO</th><th>CONVOCATORIA</th><th>NOTA</th></tr>");
                primera = false;
            }
            response.write(nota.toString());
        });
        if(!primera)
            response.write("<tr><th>.....</th><th>.....</th><th>.....</th><th>.....</th><th>.....</th></tr>");
    });
    if(!cabecera)
        response.write("</table>");
}


function filtrarEstudiante(id_estudiante, response){
    var alguno = false;
    
    alumnos.some(function(alumno){
       if(alumno.id === id_estudiante){
           var primera = true;
           alumno.notas.forEach(function(nota){
              if(primera){
                  response.write("<h1>Estudiante con ID: " + id_estudiante + "</h1>")
                  response.write("<table><tr class=\"cab\"><th>ID</th><th>NOMBRE</th><th>APELLIDOS</th><th>GENERO</th><th>F.NACIMIENTO</th></tr>");
                  response.write(alumno.toString());
                  response.write("<tr class=\"cabnotas\"><th>-----</th><th>ASIGNATURA</th><th>CURSO</th><th>CONVOCATORIA</th><th>NOTA</th></tr>");
                  primera = false;
              }
               response.write(nota.toString());
               alguno = true;
           });
           if(!primera)
               response.write("</table>");
           return;
       }
    });
    
    if(alguno === false)
        response.write("<h1>No existe ningún ESTUDIANTE con el ID: " + id_estudiante + "</h1>")
}

function filtrarCurso(curso, response){
    var alguno = false;
    var cabecera = true;
    
    alumnos.forEach(function(alumno){
        var primera = true;
        alumno.notas.forEach(function(nota){
           if(nota.curso === curso){
               if(cabecera){
                   response.write("<h1>Notas de los estudiantes del curso: " + curso + "</h1>");
                   response.write("<table><tr class=\"cab\"><th>ID</th><th>NOMBRE</th><th>APELLIDOS</th><th>GENERO</th><th>F.NACIMIENTO</th></tr>");
                   cabecera = false;
               }
               if(primera){
                   response.write(alumno.toString());
                   response.write("<tr class=\"cabnotas\"><th>-----</th><th>ASIGNATURA</th><th>CURSO</th><th>CONVOCATORIA</th><th>NOTA</th></tr>");
                   primera = false;
               }
               response.write(nota.toString());
               alguno = true;
           }
        });
        if(!primera)
                response.write("<tr><th>.....</th><th>.....</th><th>.....</th><th>.....</th><th>.....</th></tr>");
    });
    
    if(!alguno)
        response.write("<h1>No existe ninguna nota del curso: " + curso + "</h1>");
    else
        response.write("</table>");
}

function filtrarAsignatura(asignatura, response){
    var alguno = false;
    var cabecera = true;
    
    alumnos.forEach(function(alumno){
        primera = true;
        alumno.notas.forEach(function(nota){
           if(nota.id === asignatura){
               if(cabecera){
                   response.write("<h1>Notas de los estudiantes de la asignatura: " + asignatura + "</h1>");
                   response.write("<table><tr class=\"cab\"><th>ID</th><th>NOMBRE</th><th>APELLIDOS</th><th>GENERO</th><th>F.NACIMIENTO</th></tr>");
                   cabecera = false;
               }
               if(primera){
                   response.write(alumno.toString());
                   response.write("<tr class=\"cabnotas\"><th></th><th>ASIGNATURA</th><th>CURSO</th><th>CONVOCATORIA</th><th>NOTA</th></tr>");
                   primera = false;
               }
               response.write(nota.toString());
               alguno = true;
           } 
        });
        if(!primera)
            response.write("<tr><th>.....</th><th>.....</th><th>.....</th><th>.....</th><th>.....</th></tr>");
    });
    
    if(!alguno)
        response.write("<h1>No existe ninguna nota de la asignatura: " + asignatura + "</h1>");
    else
        response.write("</table>");
}