var theme = 'dark';
var w = screen.availWidth;
var h = screen.availHeight;
var input = 'null';
var newtext ='';
var isLandscape = true;
var domTable = 'box';
var boxcount = 0;
var allText = 'bad';
var data = [];

function selreflector(){
    var e = document.getElementById('weapon');
    document.getElementById('type').innerText = data[e.value][1] + '" ' + data[e.value][2];
}

function updatebs(){
    var e = document.getElementById('bs').value;
    document.getElementById('bsdisplay').innerText = e+'+';
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
    document.getElementById('unit').innerHTML = append;
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
    var army = document.getElementById('input').value;
    console.log(army);
    var file = '/'+army+'manifest.txt'
    readTextFile(file, callback);
}

function populateWargear(){
    var unit = document.getElementById('unit').value;
    var i = Number(unit)+1;
    var append = ''
    for(;; i++){
        if (data[i][0][0] === '-'){
            break;
        }else{
            var line = '<option value="' + i + '">' + data[i][0] + '</option>\n';
            append += line
        }
    }document.getElementById('weapon').innerHTML = append;
    selreflector();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('unit').addEventListener("change",populateWargear);
    document.getElementById('input').addEventListener("change",populateArmy);
    document.getElementById('bs').addEventListener("mousemove",updatebs)
});