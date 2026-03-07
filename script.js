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
],

"RM":[
{name:"RM8",Ap:0.7,Ae:0.00006},
{name:"RM10",Ap:1.5,Ae:0.00009}
],

"PQ":[
{name:"PQ26",Ap:1.2,Ae:0.00009},
{name:"PQ32",Ap:3.1,Ae:0.00014}
],

"Toroidal":[
{name:"T20",Ap:0.8,Ae:0.00008},
{name:"T30",Ap:2.5,Ae:0.00015}
]

}

const awg = {

10:2.59,
12:2.05,
14:1.63,
16:1.29,
18:1.02,
20:0.81,
22:0.64,
24:0.51,
26:0.40,
28:0.32,
30:0.25

}

let resultsData = {}

function calculate(){

let Vin = parseFloat(document.getElementById("vin").value)
let Vout = parseFloat(document.getElementById("vout").value)
let freqk = parseFloat(document.getElementById("freq").value)
let P = parseFloat(document.getElementById("power").value)

let f = freqk * 1000

let coreType = document.getElementById("coretype").value
let materialType = document.getElementById("material").value

let Bmax = materials[materialType].bmax

let Kw = 0.5
let Ku = 0.4
let J = 4e6

let Ap = P / (Kw * Ku * Bmax * J * f)
let Ap_cm4 = Ap * 1e8

let corelist = cores[coreType]

let dropdown = document.getElementById("selectedCore")
dropdown.innerHTML = ""

let suggestions = ""

for(let c of corelist){

if(c.Ap >= Ap_cm4){

suggestions += c.name + "<br>"

let opt = document.createElement("option")
opt.text = c.name
opt.value = c.name

dropdown.appendChild(opt)

}

}

let fHz = freqk * 1000
let skindepth = 66 / Math.sqrt(fHz)
let maxwire = 2 * skindepth

document.getElementById("calcResults").innerHTML =

`
Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴<br><br>

Possible Cores:<br>
${suggestions}

<br>

Skin Depth: ${skindepth.toFixed(3)} mm<br>
Maximum Wire Diameter: ${maxwire.toFixed(3)} mm
`

populateWire()

resultsData = {Vin,Vout,freqk,P,Ap_cm4,skindepth,maxwire}

}

function showCoreInfo(){

let materialType = document.getElementById("material").value

document.getElementById("coreInfo").innerHTML =

`
Curie Temperature: ${materials[materialType].curie} °C<br>
Maximum Flux Density: ${materials[materialType].bmax} Tesla
`

}

function calculateTurns(){

let Vin = parseFloat(document.getElementById("vin").value)
let Vout = parseFloat(document.getElementById("vout").value)
let freqk = parseFloat(document.getElementById("freq").value)

let f = freqk * 1000

let coreType = document.getElementById("coretype").value
let coreName = document.getElementById("selectedCore").value

let core = cores[coreType].find(c=>c.name===coreName)

let Ae = core.Ae

let Buser = parseFloat(document.getElementById("Buser").value)

let materialType = document.getElementById("material").value
let Bmax = materials[materialType].bmax

if(Buser > Bmax){

alert("Flux density exceeds maximum material limit")
return

}

let Np = Vin/(4*f*Buser*Ae)
let Ns = Np*(Vout/Vin)

document.getElementById("calcResults").innerHTML +=

`
<br>
Primary Turns: ${Math.round(Np)}<br>
Secondary Turns: ${Math.round(Ns)}
`

resultsData.Np = Math.round(Np)
resultsData.Ns = Math.round(Ns)

}

function populateWire(){

let pw = document.getElementById("primaryWire")
let sw = document.getElementById("secondaryWire")

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

let AwireP=Math.PI*(wireP/2)**2
let AwireS=Math.PI*(wireS/2)**2

let areaP=Ip/4
let areaS=Is/4

let strandsP=Math.ceil(areaP/AwireP)
let strandsS=Math.ceil(areaS/AwireS)

document.getElementById("strandResult").innerHTML=

`
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

resultsData.strandsP=strandsP
resultsData.strandsS=strandsS

document.getElementById("pdfBtn").style.display="block"

}

function generatePDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("High Frequency Transformer Design Report",20,20)

let y=40

for(let key in resultsData){

doc.text(`${key}: ${resultsData[key]}`,20,y)

y+=10

}

doc.setTextColor(200,200,200)

doc.text("AJ Electronics",70,150)
doc.text("https://aj-electronics.github.io/High_Frequency_Transformer_Calculator/",20,280)

doc.save("transformer_design.pdf")

}