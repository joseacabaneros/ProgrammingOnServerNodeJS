const fs = require('fs');

//METODOS GLOBALES
exports.writeHead = function(response){
    response.writeHead(200, {'content-type': 'text/html; charset=UTF-8'});
    response.write("<head><link rel='stylesheet' type='text/css' href='https://fonts.googleapis.com/css?family=Roboto'>" +
                   "<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'>" + 
                   "<script type='text/javascript' src='https://d3js.org/d3.v4.min.js'></script>" + 
                   "<title>Notas PHP</title></head>");
    var css = fs.readFileSync('css/style.css','utf8');
    response.write("<style>" + css + "</style>");
}

exports.writeFooter = function(response){
    response.write("<footer><address>Programación Orientada a Objetos - Master en Ingeniería Web.<br>" + 
                   "<a href='https://ingenieriainformatica.uniovi.es/'>Escuela de Ingeniería Informática</a>" + 
                   " - <a href='http://www.uniovi.es/'>Universidad de Oviedo</a>.<br>" + 
                   "<a href='mailto:uo234549@uniovi.es'>Jose Antonio Cabañeros Blanco</a></address><div><p>" + 
                   "<a href='https://validator.w3.org/check/referer'><img style='border:0;width:88px;height:31px'" + 
                   "src='http://www.hotelmaisonnave.es/wp-content/themes/maisonnave/images/W3C_HTML5_certified.png'" + 
                   "alt='¡HTML Válido!' /></a></p><p>" + 
                   "<a href='http://jigsaw.w3.org/css-validator/check/referer'><img style='border:0;" + 
                   "width:88px;height:31px' src='http://jigsaw.w3.org/css-validator/images/vcss' alt='¡CSS Válido!'/>" + 
                   "</a></p></div></footer>");
    response.end();
}