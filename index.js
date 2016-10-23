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
                consultaGet(request, response);
            else if(request.url === "/estadisticas")
                estadisticas(request, response);
            else if(request.url === "/administrar")
                administrarGet(request, response);
            else
                index(request, response);
            break;
        case 'POST':
            if(request.url === "/consulta")
                consultaPost(request, response);
            else if(request.url === "/administrar")
                administrarPost(request, response);
            break;
    }
    console.log("URL solicitada: " + request.url);
}




//METODO DE LA PAGINA PRINCIPAL

function index(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    response.write("<h1>PAGINA PRINCIPAL</h1>" +
           "<p><a href='/consulta'>CONSULTAR NOTAS</a></p><p><a href='/estadisticas'>ESTADISTICAS</a></p><p><a href='/administrar'>ADMINISTRAR</a></p>");
    response.end();
}





//METODOS DE LA PARTE DE CONSULTA DE NOTAS

function consultaGet(request, response){
    response.writeHead(200, {'content-type': 'text/html'});
    writeBodyFormConsulta(response);
    cruzarDatos();
    printListadoEstudiantes(response);
    response.end();
}

function consultaPost(request, response){
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
        response.writeHead(200, {'content-type': 'text/html'});
        writeBodyFormConsulta(response);
        
        var id_estudiante = fields.estudiante;
        var curso = fields.curso;
        var asignatura = fields.asignatura;
        
        console.log(id_estudiante);
        console.log(curso);
        console.log(asignatura);
        
        if(id_estudiante !== "")
            filtrarEstudiante(id_estudiante, response);
        else if(curso !== "")
            filtrarCurso(curso, response);
        else if(asignatura !== "")
            filtrarAsignatura(asignatura, response);
        else
            printListadoEstudiantes(response);
        
        response.end();
    });
}

function writeBodyFormConsulta(response){
    response.write("<p><a href='/'>ATRAS</a></p>");
    response.write("<form action=\"/consulta\" method=\"POST\" enctype=\"multipart/form-data\">" + 
                        "<label>ID estudiante:<input type=\"text\" name=\"estudiante\" placeholder=\"ID0050\"></label>" + 
                        "<label>Curso: <input type=\"text\" name=\"curso\" placeholder=\"2014-15\"></label>" + 
                        "<label>Asignatura: <input type=\"text\" name=\"asignatura\" placeholder=\"C1\"></label>" + 
                        "<input type=\"submit\" value=\"Buscar\" name=\"buscar\" class=\"button\">" +
                   "</form>");
}





//METODOS DE LA PARTE DE ESTADISTICAS

function estadisticas(request, response){
    response.writeHead(200, {'content-type': 'text/html; charset=UTF-8'});
    response.write("<head><link rel='stylesheet' type='text/css' href='https://fonts.googleapis.com/css?family=Roboto'>" +
                   "<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'>" + 
                   "<script type='text/javascript' src='https://d3js.org/d3.v4.min.js'></script>" + 
                   "<title>Notas PHP</title></head>");
    var css = fs.readFileSync('css/style.css','utf8');
    var script_prot = fs.readFileSync('js/proteic.min.js', 'utf8');
    response.write("<style>" + css + "</style>");
    response.write("<script>" + script_prot + "</script>")
    cruzarDatos();
    //DIVS DE LOS QUE HARA USO PROTEIC PARA DIBUJAR LOS GRAFICOS
    response.write("<div><article class='white'>" + 
                   "<h2>Nota Media de todas las notas</h2>" + 
                   "<div id='gauge-nota-media'></div></article>" + 
                   "<article><h2>Estadísticas por Género</h2><div id='barchar-por-genero'></div>" + 
                   "<div id='barchar-genero-nota-media'></div></article>" + 
                   "<article class='white'><h2>Estadísticas por Convocatoria</h2><div id='barchar-por-convocatoria-apro-susp'></div>" + 
                   "<label>Aprobados (actual): <input id='value_conv' type='text' disabled></label>" + 
                   "<div id='linearchar-por-convocatoria-porc'></div></article>" + 
                   "<article><h2>Estadísticas Año de nacimiento y Nota media</h2><label>Nota Media (actual): " + 
                   "<input id='value_anyo' type='text' disabled></label><div id='linearchar-anyo-notamedia'></div></article></div>");

    //GAUGE DE LA NOTA MEDIA DE TODOS LOS ESTUDIANTES 
    response.write("<script type='text/javascript'>//GAUGE DE LA NOTA MEDIA DE TODOS LOS ESTUDIANTES\n" +  
                   "var data = [{x:" + mediaNotas() + "}]; gauge = new proteic.Gauge(data, { label: 'Nota media'," +
                   "selector: '#gauge-nota-media', minLevel: 0, maxLevel: 10, ticks: 10,  marginLeft:370," + 
                   "width: 1000}); gauge.draw();");
    
    //BARCHAR CON EL NUMERO DE ESTUDIANTES POR GENERO
    var est_genero = estudiantesPorGenero();
    response.write("//BARCHAR CON EL NUMERO DE ESTUDIANTES POR GENERO\n data = [{x: 'Género', key: 'Hombres', y: " + est_genero[0] + "}," + 
                   "{x: 'Género', key: 'Mujeres', y: " + est_genero[1] + "}];" + 
                   "var barchart = new proteic.Barchart(data, {selector: '#barchar-por-genero', " + 
                   "yAxisLabel: 'Estudiantes', marginLeft:150, marginRight:150}); barchart.draw();");
    
    //BARCHAR CON LA MEDIA DE NOTAS POR GENERO
    var media_genero = mediaNotasPorGenero();
    response.write("//BARCHAR CON LA MEDIA DE NOTAS POR GENERO\n data = [{x: 'Género', key: 'Hombres', y: " + media_genero[0] + "}," + 
                   "{x: 'Género', key: 'Mujeres', y: " + media_genero[1] + "}]; " + 
                   "var barchartGrouped = new proteic.Barchart(data, {selector: '#barchar-genero-nota-media', " + 
                   "stacked: false, yAxisLabel: 'Nota Media', marginLeft:150, marginRight:150}); " + 
                   "barchartGrouped.draw();");
    
    //BARCHAR DE APROBADOS Y SUSPENSOS POR CONVOCATORIA 
    var por_conv_1 = porConvocatoria(1);
    var por_conv_2 = porConvocatoria(2);
    var por_conv_3 = porConvocatoria(3);
    response.write("//BARCHAR DE APROBADOS Y SUSPENSOS POR CONVOCATORIA\n data = [{x: '1ª', key: 'Aprobados', y: " + por_conv_1[1] + "}," + 
                   "{x: '1ª', key: 'Suspensos', y: " + por_conv_1[0] + "}," + 
                   "{x: '2ª', key: 'Aprobados', y: " + por_conv_2[1] + "}," + 
                   "{x: '2ª', key: 'Suspensos', y: " + por_conv_2[0] + "}," + 
                   "{x: '3ª', key: 'Aprobados', y: " + por_conv_3[1] + "}," + 
                   "{x: '3ª', key: 'Suspensos', y: " + por_conv_3[0] + "}];" + 
                   "var barchartGrouped = new proteic.Barchart(data, {selector: '#barchar-por-convocatoria-apro-susp'," + 
                   "stacked: false, yAxisLabel: 'Estudiantes', xAxisLabel: 'Convocatoria', marginLeft:150, " + 
                   "marginRight:150}); barchartGrouped.draw();");
    
    //LINEARCHAR PORCENTAJE DE APROBADOS RESPECTO POR CONVOCATORIA Y POR ASIGNATURA
    var asignaturas = getAsignaturas();
    response.write("//LINEARCHAR PORCENTAJE DE APROBADOS RESPECTO POR CONVOCATORIA Y POR ASIGNATURA\n var dataArea = [];");
    asignaturas.forEach(function(asig){
        response.write("dataArea.push({key:\"" + asig + "\", x:1, y:" + 
                      porcentajeAprobadosporConvocatoriaAsignatura(1, asig) + "});");
        response.write("dataArea.push({key:\"" + asig + "\", x:2, y:" + 
                      porcentajeAprobadosporConvocatoriaAsignatura(2, asig) + "});");
        response.write("dataArea.push({key:\"" + asig + "\", x:3, y:" + 
                      porcentajeAprobadosporConvocatoriaAsignatura(3, asig) + "});");       
    });
    response.write("areaLinechart = new proteic.Linechart(dataArea, {selector: '#linearchar-por-convocatoria-porc'," + 
                   "yAxisLabel: 'Aprobados (%)', xAxisLabel: 'Convocatoria', area: true, width: '100%', height: 400, " + 
                   "onHover: (d) => document.getElementById('value_conv').value = (d.y + '%'), onLeave: (d) => " + 
                   "document.getElementById('value_conv').value = '',}); areaLinechart.draw();");
    
    //LINEARCHAR NOTA MEDIA POR AÑO DE NACIMIENTO DE LOS ESTUDIANTES
    response.write("//LINEARCHAR NOTA MEDIA POR AÑO DE NACIMIENTO DE LOS ESTUDIANTES\n var temporalData = [];");
    var f_n = porFechaNacimiento();
    f_n.forEach(function(fn){
       response.write("temporalData.push({key: \"Año nacimiento/Nota media\" , x:" + fn[0]  + ", y:" + fn[1] + "});");
    });
    response.write("temporalLinechart = new proteic.Linechart(temporalData, {xAxisType: 'time', xAxisFormat: '%y', " + 
                   "selector: '#linearchar-anyo-notamedia', width: '100%', areaOpacity: 0, xAxisLabel: 'Año de Nacimiento'," + 
                   "yAxisLabel: 'Nota Media', onHover: (d) => document.getElementById('value_anyo').value = d.y, " + 
                   "onLeave: (d) => document.getElementById('value_anyo').value = '',}); temporalLinechart.draw();");
    response.write("</script>");
    
    response.end();
}




//METODOS DE LA PARTE DE ADMINISTRAR

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
        
        //console.log(fields.enviar_name);
        //console.log(fields.reset_name);
        
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






//METODOS DE FUNCIONALIDAD
//CONSULTA
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


//ESTADISTICAS
function mediaNotas(){
    var nota_media = 0;
    var num_elementos = 0;
    
    alumnos.forEach(function(alumno){
       alumno.notas.forEach(function(nota){
           if(typeof(nota.valor) === "number"){
               nota_media += nota.valor;
               num_elementos++;
           }
       }); 
    });
    if(num_elementos === 0)
        return 0;
    return Math.round((nota_media/num_elementos) * 1000) / 1000;
}

function estudiantesPorGenero(){
    //Primera posicion HOMBRES
    //Segunda posicion MUJERES
    var genero = [0, 0];
    
    alumnos.forEach(function(alumno){
        if(alumno.genero === "Hombre")
            genero[0]++;
        else
            genero[1]++;
    });
    
    return genero;
}

function mediaNotasPorGenero(){
    var genero = new Array(2);
    var media_nota_hombres = 0;
    var hombres = 0;
    var media_nota_mujeres = 0;
    var mujeres = 0;
    
    alumnos.forEach(function(alumno){
       alumno.notas.forEach(function(nota){
           if(typeof(nota.valor) === "number"){
               if(alumno.genero === "Hombre"){
                   media_nota_hombres += nota.valor;
                   hombres++;
               }else{
                   media_nota_mujeres += nota.valor;
                   mujeres++;
               }
           }
       });
    });
    //Primera posicion media HOMBRES
    if(hombres === 0) genero[0] = 0;
    else genero[0] = Math.round((media_nota_hombres/hombres) * 1000) / 1000;
    //Segundo posicion media MUJERES
    if(mujeres === 0) genero[1] = 0;
    else genero[1] = Math.round((media_nota_mujeres/mujeres) * 1000) / 1000;
    
    return genero;
}

function porConvocatoria(conv){
    //Primera posicion SUSPENSOS
    //Segunda posicion APROBADOS
    var convocatoria = [0, 0];
    
    alumnos.forEach(function(alumno){
       alumno.notas.forEach(function(nota){
          if((nota.convocatoria === conv) && (typeof(nota.valor) === "number")){
              convocatoria[0]++;
              if(nota.valor > 5)
                  convocatoria[1]++;
          }
       });
    });
    convocatoria[0] = convocatoria[0] - convocatoria[1];
    return convocatoria;
}

function getAsignaturas(){
    var asignaturas = new Array();
    var controlador = true;
    
    alumnos.forEach(function(alumno){
       alumno.notas.forEach(function(nota){
           controlador = true;
           asignaturas.some(function(asig){
               if(nota.id === asig){
                   controlador = false;
                   return;
               }
           });
           if(controlador)
               asignaturas.push(nota.id);
       });
    });
    return asignaturas;
}

function porcentajeAprobadosporConvocatoriaAsignatura(conv, id_asig){
    var aprobados = 0;
    var suspensos = 0;
    
    alumnos.forEach(function(alumno){
       alumno.notas.forEach(function(nota){
           if((nota.convocatoria === conv) && (nota.id === id_asig) && typeof(nota.valor) === "number"){
               if(nota.valor > 5)
                   aprobados++;
               else
                   suspensos++;
           }
       });
    });
    if(aprobados+suspensos === 0)
        return 0;
    return Math.round((aprobados/(aprobados+suspensos)) * 100 * 10) / 10;
}

function porFechaNacimiento(){
    var fechas = new Array();
    var controlador = true;
    var total = new Array();
    var ret = new Array();
    
    alumnos.forEach(function(alumno){
        controlador = true;
        var dateParts = alumno.nacimiento.split("-");
        var y = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).getFullYear().toString().substr(2,2);
        fechas.some(function(f){
            if(y === f){
                controlador = false;
                return;
            }
        });
        if(controlador) fechas.push(y);
    });
    fechas.sort();
    
    fechas.forEach(function(fech){
        ret.push(notaMediaAnyo(fech));
    });
    return ret;
}

function notaMediaAnyo(anyo){
    var anyo_nota = new Array();
    var elementos = 0;
    var notas = 0;
    
    alumnos.forEach(function(alumno){
        var dateParts = alumno.nacimiento.split("-");
        var y = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).getFullYear().toString().substr(2,2);
        if(anyo === y)
            alumno.notas.forEach(function(nota){
                if(typeof(nota.valor) === "number"){
                    elementos++;
                    notas += nota.valor;
                }
            });
    });
    anyo_nota[0] = anyo;
    
    if(elementos === 0) anyo_nota.push(0);
    else anyo_nota.push(Math.round((notas/elementos) * 100) / 100);
    //console.log(anyo_nota[0] + "   " + anyo_nota[1]);
        
    return anyo_nota;
}