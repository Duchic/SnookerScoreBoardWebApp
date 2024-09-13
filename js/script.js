var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;


var maxpoints = 147;
var remaining = 147;
var ahead = 0;
var towin = 74;

var redcount = 15;
var colors_finish = 27;

var p1redused = 0;
var p1blackused = 0;
var p1pinkused = 0;
var p1blueused = 0;
var p1brownused = 0;
var p1greenused = 0;
var p1yellowused = 0;

var p2redused = 0;
var p2blackused = 0;
var p2pinkused = 0;
var p2blueused = 0;
var p2brownused = 0;
var p2greenused = 0;
var p2yellowused = 0;

function Hello() {
    alert("Hello, World");
 }

function Red(player) {
    if(player === "p1"){
        console.log("x");
        p2break = 0;
        p1point = p1point+1;
        p1break = p1break+1;
        p1redused = p1redused+1;
        document.getElementById("p1points").innerHTML = "p1point";
        document.getElementById("p1break").innerHTML = "p1break";
    }

    if(player == "p2"){
        p1break = 0;
        p2point = p2point+1;
        p2break = p2break+1;
        p2redused = p2redused+1;
    }
}

function Black(player) {
    if(player == "p1"){
        p1point = p1point+7;
        p1break = p1break+7;
        p1blackused = p1blackused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+7;
        p2break = p2break+7;
        p2blackused = p2blackused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function Pink(player) {
    if(player == "p1"){
        p1point = p1point+6;
        p1break = p1break+6;
        p1pinkused = p1pinkused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+6;
        p2break = p2break+6;
        p2pinkused = p2pinkused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function Blue(player) {
    if(player == "p1"){
        p1point = p1point+5;
        p1break = p1break+5;
        p1blueused = p1blueused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+5;
        p2break = p2break+5;
        p2blueused = p2blueused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function Brown(player) {
    if(player == "p1"){
        p1point = p1point+4;
        p1break = p1break+4;
        p1brownused = p1brownused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+4;
        p2break = p2break+4;
        p2brownused = p2brownused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function Green(player) {
    if(player == "p1"){
        p1point = p1point+3;
        p1break = p1break+3;
        p1greenused = p1greenused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+3;
        p2break = p2break+3;
        p2greenused = p2greenused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function Yellow(player) {
    if(player == "p1"){
        p1point = p1point+2;
        p1break = p1break+2;
        p1yellowused = p1yellowused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }

    if(player == "p2"){
        p2point = p2point+2;
        p2break = p2break+2;
        p2yellowused = p2yellowused+1;
        //body co zbývají na stole
        //rozdíl mezi hráči
    }
}

function RedCount() {
    redcount--;
    document.getElementById("p1red").value = "redCount";
    if(redcount == 0){
        document.getElementById("p1red").disabled = true;
    }
}

function AheadCount(p1point, p2point) {
    if(p1point - p2point > 0){
        return p1point - p2point;
    }else {
        return p2point - p1point;
    }
}