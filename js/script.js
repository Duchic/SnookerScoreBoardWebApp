var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;


var maxpoints = 147;
var remaining = 147;
var ahead = 0;
var towin = 74;

var redcount = 15;
const COLOR_FINISH = 27;

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

const RED = 1;
const BLACK = 7;
const PINK = 6;
const BLUE = 5;
const BROWN = 4;
const GREEN = 3;
const YELLOW = 2;


function Red(player) {
    console.log(player);
    if (player === "p1"){
        //console.log("p1");
        p2break = 0;
        p1break = p1break + RED;
        p1point = p1point + RED;
        p1redused++;
        redcount--;
        document.getElementById("p1points").innerHTML = p1point; //dát to do jiné funkce?
        document.getElementById("p1break").innerHTML = p1break; // taky?
    } else {
        p1break = 0;
        p2point = p2point + RED;
        p2break = p2break + RED;
        p2redused++;
        redcount--;
        document.getElementById("p2points").innerHTML = p1point; //taky
        document.getElementById("p2break").innerHTML = p1break; //taky
    }

}

function RefreshUI() {
    //tady se bude refresovat cely UI
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