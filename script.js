function calculate(){

let Vin = document.getElementById("vin").value;
let Vout = document.getElementById("vout").value;
let f = document.getElementById("freq").value;
let Ae = document.getElementById("ae").value;
let B = document.getElementById("b").value;

let Np = Vin/(4*f*B*Ae);
let Ns = Np*(Vout/Vin);

document.getElementById("result").innerHTML =
"Primary Turns: " + Np +
"<br>Secondary Turns: " + Ns;

}