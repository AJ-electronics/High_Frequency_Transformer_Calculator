import {calculateCoreSelection} from "./calculations/coreSelection.js"
import {calculateTurns} from "./calculations/turnsCalculation.js"
import {calculateInductance} from "./calculations/inductanceCalculation.js"
import {calculateCoreLoss} from "./calculations/coreLossCalculation.js"
import {calculateCopperLoss} from "./calculations/copperLossCalculation.js"
import {calculateWindowFill} from "./calculations/windowFillCalculation.js"
import {calculateThermal} from "./calculations/thermalCalculation.js"

let resultsData={}

/* -------------------------
CORE IMAGE UPDATE
--------------------------*/

window.updateCoreImage=function(){

let core=document.getElementById("coretype").value
let img=document.getElementById("coreImage")

if(core=="ETD") img.src="./Pictures/etd.png"
if(core=="EE") img.src="./Pictures/ee.png"
if(core=="PQ") img.src="./Pictures/pq.png"
if(core=="RM") img.src="./Pictures/rm.png"
if(core=="EP") img.src="./Pictures/ep.png"
if(core=="EFD") img.src="./Pictures/efd.png"
if(core=="Toroidal") img.src="./Pictures/toroidal.png"

}


/* -------------------------
MAIN CALCULATE BUTTON
--------------------------*/

window.calculate=function(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let freqk=parseFloat(document.getElementById("freq").value)
let power=parseFloat(document.getElementById("power").value)

let freq=freqk*1000

let material=materials[document.getElementById("material").value]

let coreType=document.getElementById("coretype").value
let coreList=cores[coreType]

let coreResult=calculateCoreSelection(Vin,freq,power,material,coreList)

let Ap=coreResult.areaProduct

let suggestions=""

let select=document.getElementById("selectedCore")

select.innerHTML=""

coreResult.cores.forEach(c=>{

let opt=document.createElement("option")

opt.value=c.name
opt.text=c.name

select.appendChild(opt)

suggestions+=c.name+"<br>"

})

let skinDepth=66/Math.sqrt(freq)

document.getElementById("calcResults").innerHTML=

`
Minimum Area Product: ${Ap.toFixed(2)} cm⁴ <br><br>

Possible Cores:<br>

${suggestions}

<br>

Skin Depth: ${skinDepth.toFixed(3)} mm

`

populateWire()

resultsData={Vin,Vout,freqk,power}

}


/* -------------------------
CORE INFORMATION
--------------------------*/

window.showCoreInfo=function(){

let material=materials[document.getElementById("material").value]

document.getElementById("coreInfo").innerHTML=

`
Curie Temperature: ${material.curie} °C <br>
Maximum Flux Density: ${material.bmax} T
`

}


/* -------------------------
TURN CALCULATION
--------------------------*/

window.calculateTurns=function(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let freqk=parseFloat(document.getElementById("freq").value)

let freq=freqk*1000

let Buser=parseFloat(document.getElementById("Buser").value)

let coreType=document.getElementById("coretype").value
let coreName=document.getElementById("selectedCore").value

let core=cores[coreType].find(c=>c.name===coreName)

let turns=calculateTurns(Vin,Vout,freq,Buser,core.Ae)

document.getElementById("turnResults").innerHTML=

`
Primary Turns: ${turns.Np}<br>
Secondary Turns: ${turns.Ns}
`

resultsData.Np=turns.Np
resultsData.Ns=turns.Ns


let L=calculateInductance(turns.Np,core.Ae,core.le)

document.getElementById("inductanceResults").innerHTML=

`Magnetizing Inductance: ${(L*1e6).toFixed(2)} µH`

resultsData.inductance=L


let material=materials[document.getElementById("material").value]

let coreLoss=calculateCoreLoss(freqk,Buser,material)

document.getElementById("coreLossResults").innerHTML=

`Core Loss Density: ${coreLoss.toFixed(3)} W/cm³`

resultsData.coreLoss=coreLoss

}


/* -------------------------
WIRE TABLE
--------------------------*/

function populateWire(){

let p=document.getElementById("primaryWire")
let s=document.getElementById("secondaryWire")

p.innerHTML=""
s.innerHTML=""

for(let g in awg){

let text="AWG "+g+" ("+awg[g]+" mm)"

let o1=document.createElement("option")
o1.text=text
o1.value=awg[g]

p.appendChild(o1)

let o2=document.createElement("option")
o2.text=text
o2.value=awg[g]

s.appendChild(o2)

}

}


/* -------------------------
STRAND + COPPER LOSS
--------------------------*/

window.calculateStrands=function(){

let Vin=parseFloat(document.getElementById("vin").value)
let Vout=parseFloat(document.getElementById("vout").value)
let power=parseFloat(document.getElementById("power").value)

let Ip=power/Vin
let Is=power/Vout

let wireP=parseFloat(document.getElementById("primaryWire").value)
let wireS=parseFloat(document.getElementById("secondaryWire").value)

let AwireP=Math.PI*(wireP/2)**2
let AwireS=Math.PI*(wireS/2)**2

let strandsP=Math.ceil((Ip/4)/AwireP)
let strandsS=Math.ceil((Is/4)/AwireS)

document.getElementById("strandResult").innerHTML=

`
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

let coreType=document.getElementById("coretype").value
let coreName=document.getElementById("selectedCore").value

let core=cores[coreType].find(c=>c.name===coreName)

let copperLoss=calculateCopperLoss(

Ip,
Is,
resultsData.Np,
resultsData.Ns,
wireP,
wireS,
strandsP,
strandsS,
core

)

document.getElementById("copperLossResults").innerHTML=

`
Primary Current: ${Ip.toFixed(2)} A <br>
Secondary Current: ${Is.toFixed(3)} A <br>
Copper Loss: ${copperLoss.toFixed(3)} W
`

let fill=calculateWindowFill(

resultsData.Np,
resultsData.Ns,
wireP,
wireS,
strandsP,
strandsS,
core

)

document.getElementById("designChecks").innerHTML=

`
Window Fill Factor: ${(fill*100).toFixed(2)} % <br>
Recommended: < 40 %
`

let thermal=calculateThermal(resultsData.coreLoss,copperLoss,core)

document.getElementById("thermalResults").innerHTML=

`
Total Loss: ${thermal.loss.toFixed(2)} W <br>
Estimated Temperature Rise: ${thermal.temperature.toFixed(1)} °C
`

document.getElementById("pdfBtn").style.display="block"

}


/* -------------------------
PDF GENERATION
--------------------------*/

window.generatePDF=function(){

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