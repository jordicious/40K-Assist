// global variables
var manifest = [];
var roster = [];
var roster2 = [];
var fileHead = '';
var fileHead2 = '';
var wT = 0;

var selWeap = '';

// these remember the unit object of the currently selected unit
var selUnit = '';
var selUnit2 = '';

//trackers for save and ballistic updaters
var svTrack = false;
var bsTrack = false;
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        $('#fs')[0].innerHTML = '<img src="icons/mx.png" height="100%">'
    }
    else {
        cancelFullScreen.call(doc);
        $('#fs')[0].innerHTML = '<img src="icons/fs.png" height="100%">'
    }
}

// listeners for left army
$(document).ready(function () {
    document.getElementById('fs').addEventListener("click", function() {
        toggleFullScreen();
    }, false);

    // initial population of armies available from the armies.json file
    JSONRead('/data/armies.json', fillArmies);

    // monitors for changes to the army selector and fills the unit selector
    $('#input').change(function () {
        var army = $('#input').val();
        fileHead = 'data/' + army + '/';
        JSONRead(fileHead + 'manifest.json', populate);
        $("#input option[value='none']").remove();  //removes the default -select- option
    });

    // monitors changes to the unit selector and fills the wargear selector
    $('#unit').change(function () {
        var selUnit = $('#unit').val();
        var file = fileHead + 'roster/' + selUnit + '.json';
        JSONRead(file, pullsubunit);
        $("#unit option[value='none']").remove();   //removes the default -select- option
    });

    $("#subunit").change(function () {
        var file = fileHead + '/roster/' + $("#subunit").val() + '.json';
        JSONRead(file, fillWargear);
    });

    // monitors the wargear selector and calls the subtype checker
    $('#weapon').change(function () {
        var weapon = $('#weapon').val();
        var file = fileHead + 'manifest/' + weapon + '.json';
        JSONRead(file, pullsubs);
        $("#weapon option[value='none']").remove(); //removes the default -select- option
    });

    // monitors the subweapon selector for changes and calls the weapon display updater
    $('#subs').change(function () {
        var selWeap = $('#subs').val();
        var file = fileHead + 'manifest/' + selWeap + '.json';
        JSONRead(file, readWeapon)
    });

    $("#modelsrange").mousemove(function () {
        $('#modelstext')[0].value = $('#modelsrange').val();
    });

    $("#modelsrange").change(function () {
        $('#modelstext')[0].value = $('#modelsrange').val();
    });


    // initial hide of the subselectors
    $('#subweaponcell').hide();
    $('#subunitcell').hide();
    $('#toggle buttons').hide();

    //Adds headings to the bottom
    $('#Shots')[0].innerText = 'Number of shots made:'
    $('#Hits')[0].innerText = 'Number of hits:'
    $('#Wounds')[0].innerText = 'Number of wounds: '
    $('#Saves')[0].innerText = 'Number of saves:'
    $('#Damage')[0].innerText = 'Amount of damage: '

    document.getElementById('Shoot').onclick = function() {
        fireWeapon();
    }
});

function JSONRead(file, callback) {
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

function fillArmies(armies) {
    // JSONRead callback to fill the left armies list
    for (var i = 0; i < armies.list.length; i++) {
        var line = '<option>' + armies.list[i] + '</option>';   // generates the html option tag for each army in the armies.list array
        $('#input')[0].innerHTML += line;   //appends the option to the selector
    }
}

function populate(ros) {
    roster = ros.units;   //updates global list of available units
    $('#unit')[0].innerHTML = '<option value="none"> -select- </option>';
    for (var i = 0; i < roster.length; i++) {
        $('#unit')[0].innerHTML += '<option>' + roster[i] + '</option>';    //generates and appends option tags for each unit
    }
    $('#subunitcell').hide();
}

function pullsubunit(unit) {   // checks if the selected weapon has overcharge or similar traits and applies the subselector
    try {   //safe way of checking if the unit has the subs key in its JSON file
        var subs = unit.subs;
        $('#subunit')[0].innerHTML = ''; //clear the default option
        for (var i = 0; i < subs.length; i++) {
            var value = $('#unit').val();
            if (subs[i] !== ''){
                value += ' ' + subs[i];
                var line = '<option value="' + value + '">' + subs[i] + '</option>';
            } else {
                var line = '<option value="' + value + '">none</option>';
            }
            $('#subunit')[0].innerHTML += line;
        }
        $('#subunitcell').show(); //unhides the td that contains the subselector

    } catch (err) {
        $('#subunitcell').hide(); //hides the td that contains the subselector
        var value = unit.name;
        var line = '<option value="' + value + '">' + value + '</option>';  //essentially all this bit does is push the value of the big selector to the little one
                                                                            //this is so that we can use one function to get the name of the weapon we want to read from, and keep everything cleaner
        $('#subunit')[0].innerHTML = line;
    }
    $('#subunit').change();    //listener trigger for the subselector
    selUnit = $("#subunit").val();
    $('#subweaponcell').hide();
}

function fillWargear(unit) {
    selUnit = unit; //updates the global selected unit object
    manifest = unit.weapons;    //updates the global list of available weapons
    $('#weapon')[0].innerHTML = '<option value="none"> -select- </option>';
    for (var i = 0; i < manifest.length; i++) {
        $('#weapon')[0].innerHTML += '<option>' + manifest[i] + '</option>';    //generates and appends the names of all available weapons
    }

    var bs = unit.bs;   //this part of the function updates the values for the ballistic skill detector
    $('#slidebox')[0].innerHTML = ''; //clear the default option
    if (bs.length > 1 && bs!="NA") {     //simple check if ballistic value is an array, and if the unit has a BS at all
        var line = '<td><input type="radio" name="bs" value=' + bs[0] + ' checked><label>' + bs[0] + '+</label></td>';  //generates the first cell for the table that holds the bs buttons - keep this out of the for loop to avoid issues
        $('#slidebox')[0].innerHTML += line;
        for (var i = 1; i < bs.length; i++) {
            var line = '<td><input type="radio" name="bs" value=' + bs[i] + '><label for="bs' + i + '">' + bs[i] + '+</label></td>';    //the rest of the ballistic skills radios
            $('#slidebox')[0].innerHTML += line;
        }
    } else {
        var line = '<td><input type="radio" name="bs" value=' + bs + ' checked disabled><label for="bs">' + bs + '+</label></td>';  //if no option for ballistic, disable the checkbox to prevent unnecessary pointer events
        $("#slidebox")[0].innerHTML = line;
    }
    bsTrack = true;

    var models = selUnit.models;
    if (models < 2 || ! models){
        models = 1;
        $("#modelsrange").addClass('grey');
        $('#modelsrange')[0].max = models;
    } else {
        $("#modelsrange").removeClass('grey');
        $('#modelsrange')[0].max = models;
    }
    $("#modelsrange").change();
}

function pullsubs(weap) {   // checks if the selected weapon has overcharge or similar traits and applies the subselector
    try {   //safe way of checking if the weapon has the subs key in its JSON file
        var subs = weap.subs;
        $('#subs')[0].innerHTML = ''; //clear the default option
        for (var i = 0; i < subs.length; i++) {
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
    $('#subs').change();    //listener trigger for the subselector
}

function readWeapon(weap) {
    selWeap = weap;
    var line = weap.type + ' ' + weap.shots + ' S:' + weap.s + ' AP:' + weap.ap + ' Damage:' + weap.d;  //updates the weapon readout with stats for active weapon
    $('#type')[0].innerText = line;
    updatecomp();
    //Creates toggleable buttons
    var buttonExists=false;
    if(selWeap.special){
        for(var i=0;i<selWeap.special.length;i++)
        {
            if($.inArray("TG DMG ADV", selWeap.special)>-1){
                document.getElementById('toggle buttons').style.display='block';
                document.getElementById('TG DMG ADV').style.display='block';
                buttonExists=true;
            }
            else{
                document.getElementById('TG DMG ADV').style.display='none';
            }
            if($.inArray("Combi", selWeap.special)>-1){
            document.getElementById('toggle buttons').style.display='block';
            document.getElementById('Combi').style.display='block';
            buttonExists=true;
        }
        else{
            document.getElementById('Combi').style.display='none';
        }
        }
    }
    if(buttonExists==false){
        document.getElementById('toggle buttons').style.display='none';
    }
}

//any variable that acts on the right side should end in a 2 for ease of identification

/*Listeners for second army*/
$(document).ready(function () {
    JSONRead('data/armies.json', fillArmies2);

    $('#input2').change(function () {   //this is all the same stuff as for the left side, just for the right side
        var army = $('#input2').val();
        fileHead2 = 'data/' + army + '/';
        JSONRead(fileHead2 + 'manifest.json', populate2);
        $("#input2 option[value='none']").remove(); //removes the default -select- option
    });
    $('#unit2').change(function () {
        var file = fileHead2 + 'roster/' + $('#unit2').val() + '.json';
        $("#unit2 option[value='none']").remove(); //removes the default -select- option
        JSONRead(file, pullsubunit2);
    });
    $("#subunit2").change(function () {
        var file = fileHead2 + 'roster/' + $('#subunit2').val() + '.json';
        JSONRead(file, readUnit2);
    });
    $('#subunitcell2').hide();
});

function fillArmies2(armies) {
    for (var i = 0; i < armies.list.length; i++) {
        var line = '<option>' + armies.list[i] + '</option>';
        $('#input2')[0].innerHTML += line;
    }
}

function populate2(ros) {
    roster2 = ros.units;
    $('#unit2')[0].innerHTML = '<option value="none"> -select- </option>';
    for (var i = 0; i < roster2.length; i++) {
        $('#unit2')[0].innerHTML += '<option>' + roster2[i] + '</option>';
    }
}

function pullsubunit2(unit) {   // checks if the selected weapon has overcharge or similar traits and applies the subselector
    try {   //safe way of checking if the unit has the subs key in its JSON file
        var subs = unit.subs;
        $('#subunit2')[0].innerHTML = ''; //clear the default option
        for (var i = 0; i < subs.length; i++) {
            var value = $('#unit2').val();
            if (subs[i] !== ''){
                value += ' ' + subs[i];
                var line = '<option value="' + value + '">' + subs[i] + '</option>';
            } else {
                var line = '<option value="' + value + '">none</option>';
            }
            $('#subunit2')[0].innerHTML += line;
        }
        $('#subunitcell2').show(); //unhides the td that contains the subselector

    } catch (err) {
        $('#subunitcell2').hide(); //hides the td that contains the subselector
        var value = unit.name;
        var line = '<option value="' + value + '">' + value + '</option>';  //essentially all this bit does is push the value of the big selector to the little one
                                                                            //this is so that we can use one function to get the name of the weapon we want to read from, and keep everything cleaner
        $('#subunit2')[0].innerHTML = line;
    }
    $('#subunit2').change();    //listener trigger for the subselector
    selUnit2 = $("#subunit2").val();
    $('#subweaponcell2').hide();
}

function readUnit2(unit) {  //this function fills up saves for the active unit kind of like how the ballistic skill fills.  the only difference is that there can only be 1 or 2 saves, never 3.
    selUnit2 = unit;
    var sv = selUnit2.sv;
    $("#type2")[0].innerText = "Toughness: " + selUnit2.t + ", Save:";
    $('#type2')[0].innerText += " " + sv.sv + "+";
    $('#savebox')[0].innerHTML = '';
    var line = '<td><input type="radio" name="save" value=' + sv.sv + ' checked><label>' + sv.sv + '+</label></td>';
    $("#savebox")[0].innerHTML = line;

    if (sv.inv){
        var line = '<td><input type="radio" name="save" value=' + sv.inv + '><label>' + sv.inv + '++</label></td>';
        $('#savebox')[0].innerHTML += line;
        $('#type2')[0].innerText += " / " + sv.inv + "++"
    }

    $("#unit2 option[value='none']").remove();  //removes the default -select- option
    svTrack = true;
    updatecomp();
}

//listeners for the bottom cell
function updatecomp(){
    if (bsTrack && svTrack){
        var wR = selWeap.s / selUnit2.t;
        switch (true){  //this switch sets the Wound Threshold wT based on strength and toughness
            case (wR <= 0.5):
                wT = 6;
                break;
            case (wR > 0.5 && wR < 1):
                wT = 5;
                break;
            case (wR == 1):
                wT = 4;
                break;
            case (wR < 2):
                wT = 3;
                break;
            case (wR >= 2):
                wT = 2;
                break;
        }
        //$('#compdisplay')[0].innerText = 'Min Wound Roll: ' + wT + '+'
    }
}

//Fires weapon
function fireWeapon() {
    var bs = $('input[name="bs"]').val(); //fixes the array issue
    var models=$("#modelsrange").val();
    var nHits=0;
    var shots=0;
    var nWounds=0;
    var nSaves=0;
    var nDamage=0;
    var usingInvuln=false;
    //special property variables
    var auto=false;
    var RW1=false;
    var AH5=false;
    //Toggle button variables
    var DMG_ADV=false;
    var combi=false;
    //Determines if weapon has a special value
    if(selWeap.special)
    {
        for(var i=0;i<selWeap.special.length;i++){
            if(selWeap.special[i]=="Auto"){
                auto=true;
                bs=-100;
            }
            else if(selWeap.special[i]=="RW1")
                RW1=true;
            else if(selWeap.special[i]=="AH5")
                AH5=true;
        }
    }
    //Deals with toggleable buttons
    console.log(document.getElementById('Combi').checked);
    if(document.getElementById('TG DMG ADV').checked){
        DMG_ADV=true;
    }
    if(document.getElementById('Combi').checked){
        combi=true;
    }
    if (selUnit && selWeap) {
        //deals with variable number of shots i.e. D6 shots
        if (typeof selWeap.shots === 'string') {
            var numDice = Number(selWeap.shots[0]);
            var typeDice = Number(selWeap.shots[2]);
            for (var i = 0; i < numDice; i++) {
                shots += Math.floor(Math.random() * (typeDice) + 1);
            }
        } else {
            shots = selWeap.shots;
        }
        shots=shots*models;
        //Hit roll
        for (var i = 0; i < shots; i++) {
            var x=Math.floor(Math.random() * 6) + 1;
            if(combi)
                bs+=1;
            if(AH5 && bs>5)
                bs=5;
            if (x>= bs) {
                nHits++;
            }
        }
        if(selUnit2) {
            //Wound roll
            for (var i = 0; i < nHits; i++) {
                var x = Math.floor(Math.random() * 6) + 1;
                //Special property reroll wound roll of 1
                if (RW1 && x == 1) {
                    x = Math.floor(Math.random() * 6) + 1;
                }
                if (x >= wT) {
                    nWounds++;
                }
            }
            //Determines save value
            var save = $("input[name='save']").val();
            if (save === selUnit2.sv.inv) {
                usingInvuln = true
            } else {
                usingInvuln = false
            }
            //Save roll
            for (var i = 0; i < nWounds; i++) {
                if (usingInvuln) {
                    var x = Math.floor(Math.random() * 6) + 1;
                    if (x >= save) {
                        nSaves++;
                    }
                } else {
                    var x = Math.floor(Math.random() * 6) + 1;
                    if (x >= (save - selWeap.ap)) {
                        nSaves++;
                    }
                }
            }
            var unsaved = nWounds - nSaves;
            //Damage roll
            var damage = 0;
            for (var i = 0; i < unsaved; i++) {
                if (typeof selWeap.d === 'string') {
                    var numDice = Number(selWeap.d[0]);
                    var typeDice = Number(selWeap.d[2]);
                    damage=0;//resets damage between each unsaved shot
                    for (var i = 0; i < numDice; i++) {
                        damage += Math.floor(Math.random() * (typeDice) + 1);
                        //deals with dmg adv special property
                        if(DMG_ADV==true){
                            var y=Math.floor(Math.random() * (typeDice) + 1);
                            if(y>damage)
                                damage=y;
                        }
                    }
                } else {
                    damage = selWeap.d;
                }
                nDamage += damage;
            }
        }
        else{
            nWounds="No selection";
            nSaves="No selection";
            nDamage="No selection";        }
    } else {
        nHits="No selection";
        shots="No selection";
        nWounds="No selection";
        nSaves="No selection";
        nDamage="No selection";
    }

    $('#Shots')[0].innerText = 'Number of shots made: ' + shots;
    $('#Hits')[0].innerText = 'Number of hits: ' + nHits;
    $('#Wounds')[0].innerText = 'Number of wounds: ' + nWounds;
    $('#Saves')[0].innerText = 'Number of saves: ' + nSaves;
    $('#Damage')[0].innerText = 'Amount of Damage: ' + nDamage;



}