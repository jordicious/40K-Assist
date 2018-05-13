// global variables
var w = screen.availWidth;
var h = screen.availHeight;
var manifest = [];
var roster = {};
var fileHead = '';
var fileHead2 = '';

// these remember the unit object of the currently selected unit
var selUnit = '';
var selUnit2 = '';

// listeners for left army
$(document).ready(function(){
    // initial population of armies available from the armies.json file
    JSONRead('/data/armies.json', fillArmies)

    // monitors for changes to the army selector and fills the unit selector
    $('#input').change(function () {
        var army = $('#input').val();
        fileHead = 'data/' + army + '/';
        JSONRead(fileHead+'manifest.json', populate);
    });

    // monitors changes to the unit selector and fills the wargear selector
    $('#unit').change(function () {
        var selUnit = $('#unit').val();
        var file = fileHead + 'roster/' + selUnit + '.json';
        JSONRead(file, fillWargear)
    });

    // monitors the wargear slector and calls the subtype checker
    $('#weapon').change(function () {
        var weapon = $('#weapon').val();
        var file = fileHead+'manifest/'+weapon+'.json';
        JSONRead(file, pullsubs);
    });

    // monitors the subweapon selector for changes and calls the weapon display updater
    $('#subs').change(function () {
        var selWeap = $('#subs').val();
        var file = fileHead+'manifest/'+selWeap+'.json';
        JSONRead(file, readWeapon)
    });

    // initial hide of the subweapon selector
    $('#subweaponcell').hide();
});

function JSONRead(file,callback){
    // this function opens and parses JSON data and executes a callback function to handle it.
    // if something doesn't work in your code, don't blame this function.
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
    // JSONRead callback to fill the left armies list
    for (i = 0; i < armies.list.length; i++){
        line = '<option>' + armies.list[i] + '</option>';   // generates the html option tag for each army in the armies.list array
        $('#input')[0].innerHTML += line;   //appends the option to the selector
    }
}

function populate(ros){
    roster = ros.units;   //updates global list of available units
    $('#unit')[0].innerHTML = ''; //clear the -select- option
    for(var i=0; i < roster.length; i++){
        $('#unit')[0].innerHTML += '<option>' + roster[i] + '</option>';    //generates and appends option tags for each unit
    }
    $('#unit').change();    //fakes a change event to trigger the listener for the unit selector; forcing the next selector to update
}

function fillWargear(unit){
    selUnit = unit; //updates the global selected unit object
    manifest = unit.weapons;    //updates the global list of available weapons
    $('#weapon')[0].innerHTML = ''; //clear the -select- option
    for(var i=0; i < manifest.length; i++){
        $('#weapon')[0].innerHTML += '<option>' + manifest[i] + '</option>';    //generates and appends the names of all available weapons
    }
    $('#weapon').change();  //another listener trigger to update the weapon selector

    bs = unit.bs;   //this part of the function updates the values for the ballistic skill detector
    $('#slidebox')[0].innerHTML = ''; //clear the default option
    if (bs.length > 1){     //simple check if ballistic value is an array
        var line = '<td><input type="radio" name="bs" value=' + bs[i] + ' checked><label>' + bs[i] + '+</label></td>';  //generates the first cell for the table that holds the bs buttons - keep this out of the for loop to avoid issues
        $('#slidebox')[0].innerHTML += line;
        for (var i = 1; i < bs.length; i++) {
            var line = '<td><input type="radio" name="bs" value=' + bs[i] + '><label for="bs' + i + '">' + bs[i] + '+</label></td>';    //the rest of the ballistic skills radios
            $('#slidebox')[0].innerHTML += line;
        }
    } else {
        var line = '<td><input type="radio" name="bs" value=' + bs + ' checked disabled><label for="bs">' + bs + '+</label></td>';  //if no option for ballistic, disable the checkbox to prevent unnecessary pointer events
        $("#slidebox")[0].innerHTML = line;
    }
}

function pullsubs(weap) {   // checks if the selected weapon has overcharge or similar traits and applies the subselector
    try {   //safe way of checking if the weapon has the subs key in its JSON file
        var subs = weap.subs;
        $('#subs')[0].innerHTML = ''; //clear the default option
        for (var i=0; i < subs.length; i++){
            var value = $('#weapon').val() + ' ' + subs[i];
            var line = '<option value="' + value + '">' + subs[i] + '</option>';    //for every subtype available, generates an option for the subselector
            $('#subs')[0].innerHTML += line;
        }
        $('#subweaponcell').show(); //unhides the td that contains the subselector

    } catch (err) {
        $('#subweaponcell').hide(); //hides the td that contains the subselector
        var value = $('#weapon').val();
        var line = '<option value="' + value + '">' + value + '</option>';  //essentially all this bit does is push the value of the big selector to the little one
                                                                            //this is so that we can use one function to get the name of the weapon we want to read from, and keep everything cleaner
        $('#subs')[0].innerHTML = line;
    }
    $('#subs').change();    //another listener trigger for the subselector
}

function readWeapon(weap) {
    var line = weap.type + ' ' + weap.shots + ' S:' + weap.s + ' AP:' + weap.ap + ' Damage:' + weap.d;  //updates the weapon readout with stats for active weapon
    $('#type')[0].innerText = line;
}

//any variable that acts on the right side should end in a 2 for ease of identification

/*Listeners for second army*/
$(document).ready(function() {
    JSONRead('data/armies.json', fillArmies2);

    $('#input2').change(function () {   //this is all the same stuff as for the left side, just for the right side
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
    $('#savebox')[0].innerHTML = '';    //this function fills up saves for the active unit kind of like how the ballistic skill fills.  the only difference is that there can only be 1 or 2 saves, never 3.
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