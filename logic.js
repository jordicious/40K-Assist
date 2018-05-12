/*global variables*/
var w = screen.availWidth;
var h = screen.availHeight;
var manifest = [];
var roster = {};
var fileHead = '';
var fileHead2 = '';

var selUnit = '';
var selUnit2 = '';

/*listeners for left army*/
$(document).ready(function(){
    JSONRead('/data/armies.json', fillArmies)

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

function fillArmies(armies){
    for (i = 0; i < armies.list.length; i++){
        line = '<option>' + armies.list[i] + '</option>';
        $('#input')[0].innerHTML += line;
    }
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
    selUnit = unit;
    manifest = unit.weapons;
    $('#weapon')[0].innerHTML = '';
    for(var i=0; i < manifest.length; i++){
        $('#weapon')[0].innerHTML += '<option>' + manifest[i] + '</option>';
    }
    $('#weapon').change();

    bs = unit.bs;
    $('#slidebox')[0].innerHTML = '';
    if (bs.length > 1){
        var line = '<td><input type="radio" name="bs" value=' + bs[i] + ' checked><label>' + bs[i] + '+</label></td>';
        $('#slidebox')[0].innerHTML += line;
        for (var i = 1; i < bs.length; i++) {
            var line = '<td><input type="radio" name="bs" value=' + bs[i] + '><label for="bs' + i + '">' + bs[i] + '+</label></td>';
            $('#slidebox')[0].innerHTML += line;
        }
    } else {
        var line = '<td><input type="radio" name="bs" value=' + bs + ' checked disabled><label for="bs">' + bs + '+</label></td>';
        $("#slidebox")[0].innerHTML = line;
    }
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

/*Listeners for second army*/
$(document).ready(function() {
    JSONRead('data/armies.json', fillArmies2);

    $('#input2').change(function () {
        var army = $('#input2').val();
        fileHead2 = 'data/' + army + '/';
        JSONRead(fileHead2 + 'manifest.json', populate2);
    });
    $('#unit2').change(function () {
        file = fileHead2 + 'roster/' + $('#unit2').val() + '.json';
        JSONRead(file, readUnit2)
    })
});

function fillArmies2(armies){
    for (i = 0; i < armies.list.length; i++){
        line = '<option>' + armies.list[i] + '</option>';
        $('#input2')[0].innerHTML += line;
    }
}

function populate2(ros){
    roster2 = ros.units;
    $('#unit2')[0].innerHTML = '';
    for(var i=0; i < roster2.length; i++){
        $('#unit2')[0].innerHTML += '<option>' + roster2[i] + '</option>';
    }
    $('#unit2').change();
}

function readUnit2(unit) {
    selUnit2 = unit;
    sv = selUnit2.save;
    $('#savebox')[0].innerHTML = '';
    if (sv.length > 1){
        var line = '<td><input type="radio" name="save" value=' + sv[0] + ' checked><label>' + sv[0] + '+</label></td>';
        $('#savebox')[0].innerHTML += line;
        var line = '<td><input type="radio" name="save" value=' + sv[1] + '><label>' + sv[1] + '++</label></td>';
        $('#savebox')[0].innerHTML += line;
    } else {
        var line = '<td><input type="radio" name="save" value=' + sv + ' checked disabled><label>' + sv + '+</label></td>';
        $("#savebox")[0].innerHTML = line;
    }
}