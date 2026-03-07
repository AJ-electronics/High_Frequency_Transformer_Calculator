const materials={

"N87":{curie:220,bmax:0.3,k:3.2e-3,a:1.46,b:2.75},
"N97":{curie:210,bmax:0.32,k:2.5e-3,a:1.45,b:2.7},
"PC40":{curie:230,bmax:0.35,k:3e-3,a:1.5,b:2.8},
"3C90":{curie:215,bmax:0.3,k:2.9e-3,a:1.45,b:2.75},
"3F3":{curie:230,bmax:0.35,k:2.2e-3,a:1.44,b:2.6}

}

const cores={

"ETD":[
{name:"ETD29",Ap:0.65,Ae:0.00007,le:0.057,Aw:0.0003},
{name:"ETD39",Ap:2.4,Ae:0.000125,le:0.075,Aw:0.0006},
{name:"ETD44",Ap:4.5,Ae:0.000173,le:0.087,Aw:0.0009},
{name:"ETD49",Ap:7.8,Ae:0.000211,le:0.097,Aw:0.0013},
{name:"ETD59",Ap:17,Ae:0.000368,le:0.115,Aw:0.0025}
],

"EE":[
{name:"EE30",Ap:1.1,Ae:0.00009,le:0.060,Aw:0.0004},
{name:"EE40",Ap:2.6,Ae:0.000125,le:0.085,Aw:0.0007},
{name:"EE55",Ap:7.5,Ae:0.00025,le:0.120,Aw:0.0016}
]

}

const awg={

50:0.025,48:0.032,46:0.040,44:0.051,42:0.064,
40:0.080,38:0.101,36:0.127,34:0.160,32:0.202,
30:0.255,28:0.321,26:0.405,24:0.511,22:0.644,
20:0.812,18:1.024,16:1.291,15:1.450

}

let resultsData={}

function calculate(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let freqk=parseFloat(freq.value)
let P=parseFloat(power.value)

let f=freqk*1000

let Bmax=materials[material.value].bmax

let Ku=0.4
let J=4e6

let Ap=P/(Ku*J*Bmax*f)
let Ap_cm4=Ap*1e8

let corelist=cores[coretype.value]

selectedCore.innerHTML=""

let suggestions=""
let found=false

for(let c of corelist){

if(c.Ap>=Ap_cm4){

found=true
suggestions+=c.name+"<br>"

let opt=document.createElement("option")
opt.text=c.name
opt.value=c.name

selectedCore.appendChild(opt)

}

}

if(!found){

suggestions="No core large enough."

}

let skindepth=66/Math.sqrt(freqk*1000)

calcResults.innerHTML=

`
Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴<br><br>
Possible Cores:<br>
${suggestions}
<br>
Skin Depth: ${skindepth.toFixed(3)} mm
`

populateWire()

resultsData={Vin,Vout,freqk,P,Ap_cm4}

}

function showCoreInfo(){

let mat=material.value

coreInfo.innerHTML=

`
Curie Temperature: ${materials[mat].curie} °C<br>
Maximum Flux Density: ${materials[mat].bmax} T
`

}

function calculateTurns(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let freqk=parseFloat(freq.value)

let f=freqk*1000

let core=cores[coretype.value].find(c=>c.name===selectedCore.value)

let Ae=core.Ae
let le=core.le

let Binput=parseFloat(Buser.value)

let Np=Vin/(4*f*Binput*Ae)
let Ns=Np*(Vout/Vin)

turnResults.innerHTML=
`Primary Turns: ${Math.round(Np)}<br>Secondary Turns: ${Math.round(Ns)}`

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

async function askAI(){

let designData = {

Vin: vin.value,
Vout: vout.value,
Frequency: freq.value,
Power: power.value,
Core: selectedCore.value,
PrimaryTurns: resultsData.Np,
SecondaryTurns: resultsData.Ns,
FluxDensity: Buser.value

}

let response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyA-etvwwztpw15UUqOc4C5P-RmY9K-uqk0",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

contents:[{
parts:[{
text:
"You are an expert transformer design engineer. Analyze this transformer design and suggest improvements:\n"+
JSON.stringify(designData)
}]
}]

})

})

let data = await response.json()

let output = data.candidates[0].content.parts[0].text

document.getElementById("aiResults").innerText = output

}