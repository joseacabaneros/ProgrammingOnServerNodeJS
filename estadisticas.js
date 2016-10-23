const fs = require('fs');

var Global = require("./global.js");
var Consulta = require("./consulta.js");

var alumnos;

//METODOS DE LA PARTE DE ESTADISTICAS
exports.estadisticas = function(request, response){
    Global.writeHead(response);
    var script_prot = fs.readFileSync('js/proteic.min.js', 'utf8');
    response.write("<script>" + script_prot + "</script>");
    response.write("<header><a href='/' class='button'><span>Atrás</span></a>" + 
                   "<h2>Sistema de información de notas de cursos - ESTADÍSTICAS</h2>" + 
                   "<h3>NodeJS - JavaScript</h3></header>");
    alumnos = Consulta.cruzarDatos();
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

    //SCRIPT QUE RELLENA LOS DIVS DE VISUALIZACION PROTEIC
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
    
    Global.writeFooter(response);
}


//METODOS DE FUNCIONALIDAD
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