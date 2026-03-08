import {calculateCoreSelection} from "./calculations/coreSelection.js"
import {calculateTurns} from "./calculations/turnsCalculation.js"
import {calculateInductance} from "./calculations/inductanceCalculation.js"
import {calculateCoreLoss} from "./calculations/coreLossCalculation.js"
import {calculateCopperLoss} from "./calculations/copperLossCalculation.js"
import {calculateWindowFill} from "./calculations/windowFillCalculation.js"
import {calculateThermal} from "./calculations/thermalCalculation.js"

let resultsData={}

function selectCoreType(type){

document.getElementById("coretype").value = type

document.getElementById("coreImage").src =
"./Pictures/" + type.toLowerCase() + ".png"

}


function calculate(){

let Vin=parseFloat(vin.value)
let freqk=parseFloat(freq.value)
let P=parseFloat(power.value)

let freq=freqk*1000

let mat=materials[material.value]

let coreList=cores[coretype.value]

let Ku=0.4
let J=4e6
let Bmax=mat.bmax

let Ap=P/(Ku*J*Bmax*freq)

let Ap_cm4=Ap*1e8

selectedCore.innerHTML=""

let suggestions=""

coreList.forEach(c=>{

if(c.Ap>=Ap_cm4){

let opt=document.createElement("option")
opt.text=c.name
opt.value=c.name

selectedCore.appendChild(opt)

suggestions+=c.name+"<br>"

}

})

let skindepth=66/Math.sqrt(freq)

calcResults.innerHTML=

`
Minimum Area Product: ${Ap_cm4.toFixed(2)} cm⁴<br><br>
Possible Cores:<br>${suggestions}
<br>Skin Depth: ${skindepth.toFixed(3)} mm
`

populateWire()

}


function showCoreInfo(){

let mat=materials[material.value]

coreInfo.innerHTML=

`
Curie Temperature: ${mat.curie} °C<br>
Maximum Flux Density: ${mat.bmax} T
`

}


function calculateTurns(){

let Vin=parseFloat(vin.value)
let Vout=parseFloat(vout.value)
let freqk=parseFloat(freq.value)

let B=parseFloat(Buser.value)

let core=cores[coretype.value].find(c=>c.name===selectedCore.value)

let freq=freqk*1000

let Np=Vin/(4*freq*B*core.Ae)
let Ns=Np*(Vout/Vin)

resultsData.Np=Math.round(Np)
resultsData.Ns=Math.round(Ns)

turnResults.innerHTML=

`Primary Turns: ${resultsData.Np}<br>
Secondary Turns: ${resultsData.Ns}`

let mu0=4*Math.PI*1e-7
let mur=2000

let L=(mu0*mur*Np*Np*core.Ae)/core.le

inductanceResults.innerHTML=

`Magnetizing Inductance: ${(L*1e6).toFixed(2)} µH`

let mat=materials[material.value]

let coreLoss=mat.k*Math.pow(freqk,mat.a)*Math.pow(B,mat.b)

coreLossResults.innerHTML=

`Core Loss Density: ${coreLoss.toFixed(3)} W/cm³`

resultsData.coreLoss=coreLoss

}


function populateWire(){

primaryWire.innerHTML=""
secondaryWire.innerHTML=""

for(let g in awg){

let text="AWG "+g+" ("+awg[g]+" mm)"

let opt=document.createElement("option")

opt.text=text
opt.value=awg[g]

primaryWire.appendChild(opt)
secondaryWire.appendChild(opt.cloneNode(true))

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

let core=cores[coretype.value].find(c=>c.name===selectedCore.value)

let rho=1.72e-8

let AwirePm2=AwireP*1e-6
let AwireSm2=AwireS*1e-6

let Lp=resultsData.Np*core.mlt
let Ls=resultsData.Ns*core.mlt

let Rp=rho*Lp/(AwirePm2*strandsP)
let Rs=rho*Ls/(AwireSm2*strandsS)

let copperLoss=Ip*Ip*Rp+Is*Is*Rs

copperLossResults.innerHTML=

`
Primary Current: ${Ip.toFixed(2)} A<br>
Secondary Current: ${Is.toFixed(3)} A<br>
Copper Loss: ${copperLoss.toFixed(3)} W
`

let kp=0.7

let copperArea=
resultsData.Np*strandsP*AwirePm2+
resultsData.Ns*strandsS*AwireSm2

let fill=copperArea/(core.Aw*kp)

designChecks.innerHTML=

`
Window Fill Factor: ${(fill*100).toFixed(2)} %<br>
Recommended: < 40 %
`

pdfBtn.style.display="block"

}


function generatePDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Transformer Design Report",20,20)

doc.save("transformer_design.pdf")

}