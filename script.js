let resultsData={}

function updateCoreImage(){

let core=document.getElementById("coretype").value
let img=document.getElementById("coreImage")

if(core=="ETD") img.src="./Pictures/etd.jpg"
if(core=="EE") img.src="./Pictures/ee.jpg"
if(core=="PQ") img.src="./Pictures/pq.jpg"
if(core=="RM") img.src="./Pictures/rm.png"
if(core=="EP") img.src="./Pictures/ep.jpg"
if(core=="EFD") img.src="./Pictures/efd.jpg"
if(core=="Toroidal") img.src="./Pictures/torroidal.jpg"

}

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

let rho=1.72e-8
let length=0.2*(resultsData.Np+resultsData.Ns)

let Rp=rho*length/(AwireP*1e-6*strandsP)
let Rs=rho*length/(AwireS*1e-6*strandsS)

let copperLoss=Ip*Ip*Rp + Is*Is*Rs

copperLossResults.innerHTML=

`
Primary Current: ${Ip.toFixed(2)} A<br>
Secondary Current: ${Is.toFixed(2)} A<br>
Estimated Copper Loss: ${copperLoss.toFixed(3)} W
`

let core=cores[coretype.value].find(c=>c.name===selectedCore.value)

let totalCopper=
(resultsData.Np*AwireP*strandsP +
resultsData.Ns*AwireS*strandsS)*1e-6

let fill=totalCopper/core.Aw

designChecks.innerHTML=

`
Window Fill Factor: ${(fill*100).toFixed(1)} %<br>
Recommended: < 40 %
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