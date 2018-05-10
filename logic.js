/*global variables*/
var w = screen.availWidth;
var h = screen.availHeight;
var manifest = [];
var roster = {};
var fileHead = '';

/*listeners for various functions*/
$(document).ready(function(){
    $('#input').change(function () {
        var army = $('#input').val();
        fileHead = 'data/' + army + '/';
        JSONRead(fileHead+'manifest.json', populate);
    });
    $('#unit').change(function () {
        var selUnit = $('#unit').val();
        var file = fileHead + 'roster/' + selUnit + '.json';
        JSONRead(file, fillWargear)
    });
    $('#weapon').change(function () {
        var weapon = $('#weapon').val();
        var file = fileHead+'manifest/'+weapon+'.json';
        JSONRead(file, pullsubs);
    });
    $('#subs').change(function () {
        var selWeap = $('#subs').val();
        var file = fileHead+'manifest/'+selWeap+'.json';
        JSONRead(file, readWeapon)
    });
    $('#bs').mousemove(updatebs);
    $('#bs').change(updatebs);
    $('#subweaponcell').hide();
});

function JSONRead(file,callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(JSON.parse(this.responseText));
        }
    };
    xhr.open("GET", file, true);
    xhr.send();
}

function populate(ros){
    roster = ros.units;
    $('#unit')[0].innerHTML = '';
    for(var i=0; i < roster.length; i++){
        $('#unit')[0].innerHTML += '<option>' + roster[i] + '</option>';
    }
    $('#unit').change();
}

function fillWargear(unit){
    manifest = unit.weapons;
    $('#weapon')[0].innerHTML = '';
    for(var i=0; i < manifest.length; i++){
        $('#weapon')[0].innerHTML += '<option>' + manifest[i] + '</option>';
    }
    $('#weapon').change();

    bs = unit.bs;
    if (bs.length > 1){
        $('#bs')[0].min = bs[0];
        $('#bs')[0].max = bs[1];
        $('#bs')[0].value = bs[0];
        $('#bs')[0].disabled = false;
        $('#bs').removeClass('grey');
    } else {
        $('#bs')[0].min = 1;
        $('#bs')[0].max = 6;
        $('#bs')[0].value = bs;
        $('#bs')[0].disabled = true;
        console.log('addclass executing');
        $('#bs').addClass('grey');
    }
    $('#bs').change();
}

function pullsubs(weap) {
    try {
        var subs = weap.subs;
        $('#subs')[0].innerHTML = '';
        for (var i=0; i < subs.length; i++){
            var value = $('#weapon').val() + ' ' + subs[i];
            var line = '<option value="' + value + '">' + subs[i] + '</option>';
            $('#subs')[0].innerHTML += line;
        }
        $('#subweaponcell').show();

    } catch (err) {
        $('#subweaponcell').hide();
        var value = $('#weapon').val();
        var line = '<option value="' + value + '">' + value + '</option>';
        $('#subs')[0].innerHTML = line;
    }
    $('#subs').change();
}

function readWeapon(weap) {
    var line = weap.type + ' ' + weap.shots + ' S:' + weap.s + ' AP:' + weap.ap + ' Damage:' + weap.d;
    $('#type')[0].innerText = line;
}

function updatebs(){
    var e = $('#bs').val();
    $('#bsdisplay')[0].innerText = e+'+';
}