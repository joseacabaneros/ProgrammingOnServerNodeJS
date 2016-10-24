const http = require('http');

//MODULOS Y ENCAPSULACION
var Global = require("./global.js");
var Consulta = require("./consulta.js");
var Estadisticas = require("./estadisticas.js");
var Administrar = require("./administrar.js");
var Api = require("./api.js");

var server = http.createServer();
console.log("-----Servidor Arrancado-----");
server.on('request', procesa);
server.listen(8000);

function procesa(request, response){
    switch(request.method){
        case 'GET':
            if(request.url === "/consulta")
                Consulta.consultaGet(request, response);
            else if(request.url === "/estadisticas")
                Estadisticas.estadisticas(request, response);
            else if(request.url === "/administrar")
                Administrar.administrarGet(request, response);
            else if(request.url === "/personas")
                Api.personas(request, response);
            else
                index(request, response);
            break;
        case 'POST':
            if(request.url === "/consulta")
                Consulta.consultaPost(request, response);
            else if(request.url === "/administrar")
                Administrar.administrarPost(request, response);
            break;
    }
    console.log("URL solicitada: " + request.url);
}

//METODO DE LA PAGINA PRINCIPAL
function index(request, response){
    Global.writeHead(response);
    response.write("<header class='index'><h2>Sistema de información de notas de cursos</h2>" + 
                   "<h3>NodeJS - JavaScript</h3></header>");
    response.write("<div class='padding'><ul>" + 
                   "<li><a href='/consulta'>CONSULTAR NOTAS</a></li>" + 
                   "<li><a href='/estadisticas'>ESTADÍSTICAS</a></li>" +
                   "<li><a href='/administrar'>ADMINISTRAR</a></li></ul></div>");
    Global.writeFooter(response);
}