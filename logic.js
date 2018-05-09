var w = screen.availWidth;
var h = screen.availHeight;
var data = [];

function selreflector(){
    var e = $('#weapon').val();
    $('#type')[0].innerText = data[e][1] + '" ' + data[e][2];
}

function updatebs(){
    var e = $('#bs').val();
    $('#bsdisplay')[0].innerText = e+'+';
}

function callback(rawdata){
    data = rawdata.split('\n');
    var append = '';
    for (var i=0; i < data.length; i++){
        data[i] = data[i].split('|');
        if (data[i][0][0] === '-') {
            var line = '<option value="' + i + '">' + data[i][0] + '</option>\n';
            append+=line;
        }
    }
    $('#unit')[0].innerHTML = append;
    populateWargear();
}

function readTextFile(file, callback){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onload = function() {
        if(rawFile.readyState === 4){
            if(rawFile.status === 200) {
                callback(rawFile.responseText);
            }else{
                console.error(rawFile.statusText);
            }
        }else{
            console.error(rawFile.statusText);
        }
    }
    rawFile.send(null);
}

function populateArmy(){
    var army = $('#input').val();
    console.log(army);
    var file = '/'+army+'manifest.txt'
    readTextFile(file, callback);
}

function populateWargear(){
    var unit = $('#unit').val();
    var append = ''
    for(var i = Number(unit)+1;; i++){
        if (data[i][0][0] === '-'){
            break;
        }else{
            var line = '<option value="' + i + '">' + data[i][0] + '</option>\n';
            append += line
        }
    }$('#weapon')[0].innerHTML = append;
    selreflector();
}

$(document).ready(function(){
    $('#unit').change(populateWargear);
    $('#input').change(populateArmy);
    $('#bs').mousemove(updatebs);
    $('#weapon').change(selreflector);
});