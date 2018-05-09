/global variables/
var w = screen.availWidth;
var h = screen.availHeight;
var roster = [];

/listeners for various functions/
$(document).ready(function(){
    $('#input').change(populate);
    $('#unit').change(populateWargear);
    $('#bs').mousemove(updatebs);
    $('#weapon').change(selreflector);

    $('.popup').hide();
});

/generic textfile reader, takes a callback function for processing/
function readTextFile(file, callback){
    var rawFile = new XMLHttpRequest();
    console.log('opening file '+file);
    rawFile.open("GET", file, true);
    rawFile.onload = function() {
        if(rawFile.readyState === 4){
            if(rawFile.status === 200) {
                populateUnits(rawFile.responseText);
            }else{
                console.error(rawFile.statusText);
            }
        }else{
            console.error(rawFile.statusText);
        }
    }
    rawFile.send(null);
}

function populate(){
    var army = $('#input').val();
    console.log(army);
    var file = '/data/'+army+'/roster.txt'
    console.log('reading file '+file);
    readTextFile(file, populateUnits);
}

function populateUnits(rawdata){
    roster = rawdata.split('\n');
    var append = '';
    for (var i=0; i < roster.length; i++){
        roster[i] = roster[i].split('|');
        if (roster[i][0][0] === '-') {
            var line = '<option value="' + i + '">' + roster[i][0] + '</option>\n';
            append+=line;
        }
    }
    $('#unit')[0].innerHTML = append;
    populateWargear();
}

function populateWargear(){
    var unit = $('#unit').val();
    var append = ''
    for(var i = Number(unit)+1;i < roster.length; i++){
        if (roster[i][0] === '*'){
            break;
        }else{
            var line = '<option value="' + i + '">' + roster[i][0] + '</option>\n';
            append += line
        }
    }$('#weapon')[0].innerHTML = append;
    selreflector();
}

function selreflector() {
    if(roster[$('#weapon').val()][1]) {
        if($('#popup').is(':visible')){
            $('#weapon').removeClass("shorter");
            $('#popup').hide();
        }else{
            $('#weapon').addClass("shorter");
            $("#weapon").one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                $('#popup').show();
            });
        }
    }
}

function updatebs(){
    var e = $('#bs').val();
    $('#bsdisplay')[0].innerText = e+'+';
}