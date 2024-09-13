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

function Red(p1) {
    if (p1 === "p1red"){
        console.log("p1");
    }
    p2break = 0;
    p1point = p1point+1;
    p1break = p1break+1;
    p1redused = p1redused+1;
    document.getElementById("p1points").innerHTML = p1point;
    document.getElementById("p1break").innerHTML = p1break;
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