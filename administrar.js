const formidable = require('formidable'), fs = require('fs');
const folder = 'tmp/';

var Global = require("./global.js");

//METODOS DE LA PARTE DE ADMINISTRAR
exports.administrarGet = function(request, response){
    Global.writeHead(response);
    writeBodyAdministrar(response);
    response.write("</div>");
    Global.writeFooter(response);
}

exports.administrarPost = function(request, response){
    Global.writeHead(response);
    writeBodyAdministrar(response);
    
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
        //console.log(fields.enviar_name);
        //console.log(fields.reset_name);
        
        if(fields.enviar_name === "Subir JSON"){
            if(files.fichero.name === "")
                response.write("<p class=\"error\">Seleccione un archivo JSON</p>");
            else{
                fs.readFile(files.fichero.path,'utf8', (err,datos) => {
                    if (err) throw err;
                    if(files.fichero.name.substr(-5) === '.json'){
                        let json = JSON.parse(datos);
                        fs.writeFile("tmp/" + files.fichero.name, JSON.stringify(json), 'utf8', (err) => {
                            if(err) 
                                response.write("<p class=\"error\">El archivo no ha podido subirse</p>");
                            //console.log("Fichero guardado")
                        });
                    }
                });
                if(files.fichero.name.substr(-5) === '.json')
                    response.write("<p class=\"info\">El archivo " + files.fichero.name + " ha sido subido</p>");
                else
                    response.write("<p class=\"error\">El archivo subido no es JSON</p>");
            }
        }else if(fields.reset_name === "RESET"){
            fs.readdir(folder, (err, files) => {
                files.forEach(file => {
                    //console.log(file);
                    fs.unlink('tmp/' + file, (err) =>{
                        if(err) throw err;
                        //console.log("Archivo eliminado " + file);
                    })
                });
            })
            response.write("<p class=\"info\">Se han eliminado todos los archivos JSON</p>");
        }
        response.write("</div>");
        Global.writeFooter(response);
    });
    return;
}

function writeBodyAdministrar(response){
    response.write("<header><a href='/' class='button'><span>Atrás</span></a>" + 
                   "<h2>Sistema de información de notas de cursos - ADMINISTRAR</h2>" + 
                   "<h3>NodeJS - JavaScript</h3></header>");
    response.write("<!--Formulario de subida de ficheros--><div class='padding'><form action='/administrar' " + 
                 "method='POST' enctype='multipart/form-data'><label>Seleccionar el archivo JSON con las notas:" + 
                 "<input type='file' name='fichero'></label><br/><input type='submit' value='Subir JSON' " + 
                 "name='enviar_name'></form>" + 
                 "<!--Formulario reset de ficheros--><form action='/administrar' " + 
                 "method='POST' enctype='multipart/form-data'><label>Eliminar todos los archivos JSON con las notas" + 
                 "</label><br/><input type='submit' value='RESET' name='reset_name'></form>");
}