const http = require('http'), formidable = require('formidable'), fs = require('fs');
const folder = 'tmp/';

var Alumno = require("./alumno.js");
var Nota = require("./nota.js");
var alumnos;
var num_personas;

var server = http.createServer();
server.on('request', procesa);
server.listen(82);

function procesa(request, response){
    switch(request.method){
        case 'GET':
            if(request.url === "/consulta")
                consulta(request, response);
            else if(request.url === "/estadisticas")
                estadisticas(request, response);
            else if(request.url === "/administrar")
                administrarGet(request, response);
            else
                index(request, response);
            break;
        case 'POST':
            if(request.url === "/administrar")
                administrarPost(request, response);
            break;
    }
    console.log("URL solicitada: " + request.url);
}

function index(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    response.write("<h1>PAGINA PRINCIPAL</h1>" +
           "<p><a href='/consulta'>CONSULTAR NOTAS</a></p><p><a href='/estadisticas'>ESTADISTICAS</a></p><p><a href='/administrar'>ADMINISTRAR</a></p>");
    response.end();
}

function consulta(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    cruzarDatos();
    printListadoEstudiantes(response);
    response.write("<p>CONSULTA</p><p><a href='/'>ATRAS</a></p>");
    response.end();
}

function estadisticas(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    response.write('<p>ESTADISTICAS</p>' + '<p><a href=\'/\'>ATRAS</a></p>');
    response.end();
}

function administrarGet(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    writeBodyFormAdministrar(response);
    response.end();
}

function administrarPost(request, response){
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
        response.writeHead(200, {'content-type': 'text/html'});
        writeBodyFormAdministrar(response);
        
        console.log(fields.enviar_name);
        console.log(fields.reset_name);
        
        if(fields.enviar_name === "enviar"){
            fs.readFile(files.fichero.path,'utf8', (err,datos) => {
                if (err) throw err;
                let json = JSON.parse(datos);
                fs.writeFile("tmp/" + files.fichero.name, JSON.stringify(json), 'utf8', (err) => {
                    if(err) throw err;
                    console.log("Fichero guardado")
                });
                response.end("Fichero guardado");
            })
        }else if(fields.reset_name === "reset"){
            fs.readdir(folder, (err, files) => {
                files.forEach(file => {
                    console.log(file);
                    fs.unlink('tmp/' + file, (err) =>{
                        if(err) throw err;
                        console.log("Archivo eliminado " + file);
                    })
                });
            })
            response.end("Se han eliminados todos los archivos JSON");
        }
    });
    return;
}

function writeBodyFormAdministrar(response){
    response.write('<h1>Cargar fichero JSON</h1>' +
        '<form action="/administrar" enctype="multipart/form-data" method="post">'+
        '<input type="file" name="fichero"><br>'+
        '<input type="submit" name="enviar_name" value="enviar">'+
        '</form>' + 
        '<form action="/administrar" enctype="multipart/form-data" method="post">'+
        '<input type="submit" name="reset_name" value="reset">'+
        '</form>' + 
        '<p><a href=\'/\'>ATRAS</a></p>');
}

function cruzarDatos(){
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
        if(primera === false)
            response.write("<tr><th>.....</th><th>.....</th><th>.....</th><th>.....</th><th>.....</th></tr>");
    });
    response.write("</table>");
}