const materials={

"N87":{curie:220,bmax:0.3},
"N97":{curie:210,bmax:0.32},
"PC40":{curie:230,bmax:0.35},
"3C90":{curie:215,bmax:0.3},
"3F3":{curie:230,bmax:0.35}

}

const cores={

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

const awg={

50:0.025,
48:0.032,
46:0.040,
44:0.051,
42:0.064,
40:0.080,
38:0.101,
36:0.127,
34:0.160,
32:0.202,
30:0.255,
28:0.321,
26:0.405,
24:0.511,
22:0.644,
20:0.812,
18:1.024,
16:1.291,
15:1.450

}

let resultsData={}

function calculate(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let freqk=parseFloat(freq.value)
let P=parseFloat(power.value)

let f=freqk*1000

let coreType=coretype.value
let materialType=material.value

let Bmax=materials[materialType].bmax

let Kw=0.5
let Ku=0.4
let J=4e6

let Ap=P/(Kw*Ku*Bmax*J*f)
let Ap_cm4=Ap*1e8

let corelist=cores[coreType]

selectedCore.innerHTML=""

let suggestions=""

for(let c of corelist){

if(c.Ap>=Ap_cm4){

suggestions+=c.name+"<br>"

let opt=document.createElement("option")
opt.text=c.name
opt.value=c.name

selectedCore.appendChild(opt)

}

}

let fHz=freqk*1000

let skindepth=66/Math.sqrt(fHz)

let maxwire=2*skindepth

calcResults.innerHTML=

`
Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴<br><br>

Possible Cores:<br>
${suggestions}

<br>

Skin Depth: ${skindepth.toFixed(3)} mm<br>
Maximum Wire Diameter: ${maxwire.toFixed(3)} mm
`

populateWire()

resultsData={Vin,Vout,freqk,P,Ap_cm4,skindepth,maxwire}

}

function showCoreInfo(){

let materialType=material.value

coreInfo.innerHTML=

`
Curie Temperature: ${materials[materialType].curie} °C<br>
Maximum Flux Density: ${materials[materialType].bmax} Tesla
`

}

function calculateTurns(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let freqk=parseFloat(document.getElementById("freq").value)

let f=freqk*1000

let coreType=document.getElementById("coretype").value
let coreName=document.getElementById("selectedCore").value

let core=cores[coreType].find(c=>c.name===coreName)

if(!core){
alert("Please select a core first")
return
}

let Ae=core.Ae

let Binput=parseFloat(document.getElementById("Buser").value)

let materialType=document.getElementById("material").value
let Bmax=materials[materialType].bmax

if(Binput>Bmax){

alert("Flux density exceeds maximum limit")
return

}

let Np=Vin/(4*f*Binput*Ae)
let Ns=Np*(Vout/Vin)

document.getElementById("turnResults").innerHTML=

`
Primary Turns: ${Math.round(Np)}<br>
Secondary Turns: ${Math.round(Ns)}
`

resultsData.Np=Math.round(Np)
resultsData.Ns=Math.round(Ns)

}
function populateWire(){

primaryWire.innerHTML=""
secondaryWire.innerHTML=""

for(let g in awg){

let text="AWG "+g+" ("+awg[g]+" mm)"

let opt1=document.createElement("option")
opt1.text=text
opt1.value=awg[g]

primaryWire.appendChild(opt1)

let opt2=document.createElement("option")
opt2.text=text
opt2.value=awg[g]

secondaryWire.appendChild(opt2)

}

}

function calculateStrands(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let P=parseFloat(power.value)

let Ip=P/Vin
let Is=P/Vout

let wireP=parseFloat(primaryWire.value)
let wireS=parseFloat(secondaryWire.value)

let AwireP=Math.PI*(wireP/2)**2
let AwireS=Math.PI*(wireS/2)**2

let areaP=Ip/4
let areaS=Is/4

let strandsP=Math.ceil(areaP/AwireP)
let strandsS=Math.ceil(areaS/AwireS)

strandResult.innerHTML=

`
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

resultsData.strandsP=strandsP
resultsData.strandsS=strandsS

pdfBtn.style.display="block"

}

function generatePDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.setFontSize(16)
doc.text("AJ Electronics",20,20)

doc.setFontSize(11)
doc.text("High Frequency Transformer Calculator",20,28)
doc.text("https://aj-electronics.github.io/High_Frequency_Transformer_Calculator/",20,34)

doc.line(20,38,190,38)

let y=50

doc.setFontSize(12)
doc.text("Design Summary",20,y)

y+=10

doc.setFontSize(10)

for(let key in resultsData){

doc.text(`${key}`,20,y)
doc.text(`${resultsData[key]}`,120,y)

y+=8

}

doc.save("Transformer_Design_Report.pdf")

}