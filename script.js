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
]

}

const awg={
20:0.81,
22:0.64,
24:0.51,
26:0.40,
28:0.32,
30:0.25
}

let resultsData={}

function calculate(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let freqk=parseFloat(freq.value)
let P=parseFloat(power.value)

let f=freqk*1000

let coretype=coretype.value
let material=material.value

let Bmax=materials[material].bmax

let Kw=0.5
let Ku=0.4
let J=4e6

let Ap=P/(Kw*Ku*Bmax*J*f)
let Ap_cm4=Ap*1e8

let corelist=cores[coretype]

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

populateWire()

results.innerHTML=

`
Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴<br><br>

Possible Cores:<br>
${suggestions}

<br>

Skin Depth: ${skindepth.toFixed(3)} mm<br>
Maximum Wire Diameter: ${maxwire.toFixed(3)} mm
`

resultsData={Vin,Vout,freqk,P,Ap_cm4,skindepth,maxwire}

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

let coretype=coretype.value
let coreName=selectedCore.value

let core=cores[coretype].find(c=>c.name===coreName)

let Ae=core.Ae

let Buser=parseFloat(Buser.value)

let Bmax=materials[material.value].bmax

if(Buser>Bmax){

alert("Flux density exceeds material limit")
return

}

let Np=Vin/(4*f*Buser*Ae)
let Ns=Np*(Vout/Vin)

results.innerHTML+=

`
<br>
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