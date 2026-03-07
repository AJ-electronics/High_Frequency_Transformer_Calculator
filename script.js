const materials = {

"N87":{curie:220,bmax:0.3},
"N97":{curie:210,bmax:0.32},
"PC40":{curie:230,bmax:0.35},
"3C90":{curie:215,bmax:0.3},
"3F3":{curie:230,bmax:0.35}

}

const cores = {

"ETD":[
{name:"ETD29",Ap:0.65,Ae:0.00007},
{name:"ETD39",Ap:2.4,Ae:0.000125},
{name:"ETD44",Ap:4.5,Ae:0.000173},
{name:"ETD49",Ap:7.8,Ae:0.000211},
{name:"ETD59",Ap:17,Ae:0.000368}
],

"EE":[
{name:"EE30",Ap:1.1,Ae:0.00009},
{name:"EE40",Ap:2.6,Ae:0.000125},
{name:"EE55",Ap:7.5,Ae:0.00025}
]

}

const awg = {

20:0.81,
22:0.64,
24:0.51,
26:0.40,
28:0.32,
30:0.25

}

function calculate(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let freqk=parseFloat(document.getElementById("freq").value)
let f=freqk*1000
let P=parseFloat(document.getElementById("power").value)

let coretype=document.getElementById("coretype").value
let material=document.getElementById("material").value

let Bmax=materials[material].bmax

let Kw=0.5
let Ku=0.4
let J=4e6

let Ap=P/(Kw*Ku*Bmax*J*f)
let Ap_cm4=Ap*1e8

let corelist=cores[coretype]

let dropdown=document.getElementById("selectedCore")
dropdown.innerHTML=""

let suggestions=""

for(let c of corelist){

if(c.Ap>=Ap_cm4){

suggestions+=c.name+"<br>"

let opt=document.createElement("option")
opt.text=c.name
opt.value=c.name

dropdown.appendChild(opt)

}

}

let fHz=freqk*1000
let skindepth=66/Math.sqrt(fHz)
let maxwire=2*skindepth

let result=`

Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴ <br><br>

Possible Cores:<br>
${suggestions}

<br>

Skin Depth: ${skindepth.toFixed(3)} mm <br>
Maximum Wire Diameter: ${maxwire.toFixed(3)} mm

`

document.getElementById("results").innerHTML=result

populateWire()

}

function showCoreInfo(){

let material=document.getElementById("material").value

let curie=materials[material].curie
let Bmax=materials[material].bmax

document.getElementById("coreInfo").innerHTML=

`
Curie Temperature: ${curie} °C <br>
Maximum Flux Density: ${Bmax} Tesla
`

}

function calculateTurns(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let freqk=parseFloat(document.getElementById("freq").value)

let f=freqk*1000

let coretype=document.getElementById("coretype").value
let coreName=document.getElementById("selectedCore").value

let corelist=cores[coretype]

let core=corelist.find(c=>c.name===coreName)

let Ae=core.Ae

let Buser=parseFloat(document.getElementById("Buser").value)

let material=document.getElementById("material").value
let Bmax=materials[material].bmax

if(Buser>Bmax){

alert("Flux density exceeds maximum limit")

return

}

let Np=Vin/(4*f*Buser*Ae)
let Ns=Np*(Vout/Vin)

document.getElementById("results").innerHTML+=`

<br>

Primary Turns: ${Math.round(Np)} <br>
Secondary Turns: ${Math.round(Ns)}

`

}

function populateWire(){

let pw=document.getElementById("primaryWire")
let sw=document.getElementById("secondaryWire")

pw.innerHTML=""
sw.innerHTML=""

for(let g in awg){

let text="AWG "+g+" ("+awg[g]+" mm)"

let opt1=document.createElement("option")
opt1.text=text
opt1.value=awg[g]

pw.appendChild(opt1)

let opt2=document.createElement("option")
opt2.text=text
opt2.value=awg[g]

sw.appendChild(opt2)

}

}

function calculateStrands(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let P=parseFloat(document.getElementById("power").value)

let Ip=P/Vin
let Is=P/Vout

let wireP=parseFloat(document.getElementById("primaryWire").value)
let wireS=parseFloat(document.getElementById("secondaryWire").value)

let AwireP=Math.PI*Math.pow(wireP/2,2)
let AwireS=Math.PI*Math.pow(wireS/2,2)

let areaP=Ip/4
let areaS=Is/4

let strandsP=Math.ceil(areaP/AwireP)
let strandsS=Math.ceil(areaS/AwireS)

document.getElementById("strandResult").innerHTML=

`
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

}

function generatePDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("High Frequency Transformer Design",20,20)

doc.text("AJ Electronics",20,30)

doc.text("https://aj-electronics.github.io/High_Frequency_Transformer_Calculator/",20,40)

let text=document.getElementById("results").innerText

doc.text(text,20,60)

doc.save("transformer_design.pdf")

}