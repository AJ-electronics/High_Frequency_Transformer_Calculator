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

for(let c of corelist){

if(c.Ap>=Ap_cm4){

suggestions+=c.name+"<br>"

let opt=document.createElement("option")
opt.text=c.name
opt.value=c.name

selectedCore.appendChild(opt)

}

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

Np=Math.round(Np)
Ns=Math.round(Ns)

turnResults.innerHTML=

`Primary Turns: ${Np}<br>Secondary Turns: ${Ns}`

resultsData.Np=Np
resultsData.Ns=Ns

let mu0=4*Math.PI*1e-7
let mur=2000

let Lp=(mu0*mur*Math.pow(Np,2)*Ae)/le
Lp=Lp*1e6

inductanceResults.innerHTML=

`Magnetizing Inductance: ${Lp.toFixed(2)} µH`

let mat=materials[material.value]

let coreLoss=
mat.k*Math.pow(freqk,mat.a)*Math.pow(Binput,mat.b)

coreLossResults.innerHTML=

`Estimated Core Loss: ${coreLoss.toFixed(3)} W/cm³`

resultsData.coreLoss=coreLoss

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

let strandsP=Math.ceil((Ip/4)/AwireP)
let strandsS=Math.ceil((Is/4)/AwireS)

strandResult.innerHTML=

`
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

pdfBtn.style.display="block"

}

function generatePDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Transformer Design Report",20,20)

let y=40

for(let k in resultsData){

doc.text(`${k}: ${resultsData[k]}`,20,y)
y+=10

}

doc.save("transformer_design.pdf")

}