var express = require('express');
var app = express();
var ejs = require('ejs');
var fs = require('fs');
var bodyParser = require('body-parser');
var urlencodedBodyParser = bodyParser.urlencoded({extended:false});
var http = require('http');
var request = require('request');

app.use(urlencodedBodyParser);
app.use(express.static(__dirname + '/public'));

app.set('view_engine','ejs');

function getModel () {
    var data = fs.readFileSync('data.json','utf8');
    var model = JSON.parse(data);
    return model;
}

function makeNewId (letters) {
    var currentId = letters[letters.length-1].id;
    var newId = currentId + 1;
    return newId
}

app.get('/', function (req, res) {
    res.redirect('/letters/new');
});

app.get('/letters', function (req, res) {
    var model = getModel();
    console.log('-------------\n',model.letters);
    res.render('letters.ejs', {"letters":model.letters})
});

app.post('/letters', function (req, res) {
    console.log(req.body);
    var model = getModel();
    var id = makeNewId(model.letters);
    var newLetter = {"id":id,"name":req.body.name,"addressOne":req.body.addressOne,"addressTwo":req.body.addressTwo,"city":req.body.city,"state":req.body.state,"zip":req.body.zip,"country":req.body.country,"text":req.body.text,"giphyWords":req.body.giphyWords};
    
    newLetter.giphyWords = newLetter.giphyWords.match(/\w+/g);
    
    var JSONgiphyData = request("http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag="+newLetter.giphyWords.join('+'), function (err, response, body) {
        var giphyData = JSON.parse(body);
        var giphyUrl = giphyData.data.image_url;
        
        console.log(giphyData);



        newLetter.giphyUrl = giphyUrl;
        model.letters.push(newLetter);
        
        console.log('------------------');
        console.log(model.letters);
        
        var updatedData = JSON.stringify(model);
        fs.writeFileSync('data.json', updatedData);
        res.redirect('/letters');    
    });    
});

app.get('/letters/new', function (req, res) {
    var model = getModel();
    res.render('new-letter.ejs',{"letters":model.letters});
});

app.get('/letters/:id', function (req, res) {
    var model = getModel();
    var letters = model.letters;
    var letterList = letters.map(function(letter){
        return letter.id;
    });
    var letter = letters[letterList.indexOf(parseInt(req.params.id))];
    res.render('view-letter.ejs',{"letters":letters,"letter":letter});
});

var server = app.listen(3000,function(){
    console.log('listening on port 3000');
});

