const fs = require('fs');
const folder = 'tmp/';

//http://156.35.98.12:8000/personas
exports.personas = function(request, response){
    fs.readFile( "resources/" + "personas.json", 'utf8', function (err, data) {
        response.end(data);
    });
}

/**
exports.persona = function(request, response){
    if(request.params === undefined || request.params.id === undefined)
        response.end("Necesario el parametro id");
    else{
        var json = JSON.parse(fs.readFileSync('resources/personas.json','utf8'));
        var pers = json['personas'];
        pers.forEach(function(persona){
            if(persona["id"] === request.params.id)
                response.end(JSON.stringify(per));
        });
    }
}
**/