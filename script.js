import {calculateCoreSelection} from "./calculations/coreSelection.js"
import {calculateTurns} from "./calculations/turnsCalculation.js"
import {calculateInductance} from "./calculations/inductanceCalculation.js"
import {calculateCoreLoss} from "./calculations/coreLossCalculation.js"
import {calculateCopperLoss} from "./calculations/copperLossCalculation.js"
import {calculateWindowFill} from "./calculations/windowFillCalculation.js"
import {calculateThermal} from "./calculations/thermalCalculation.js"
import {calculateStrands} from "./calculations/strandCalculation.js"

let resultsData = {}

// DOM elements
const vin = document.getElementById("vin")
const vout = document.getElementById("vout")
const freq = document.getElementById("freq")
const power = document.getElementById("power")

const coretype = document.getElementById("coretype")
const material = document.getElementById("material")

const calcResults = document.getElementById("calcResults")
const selectedCore = document.getElementById("selectedCore")
const coreInfo = document.getElementById("coreInfo")

const Buser = document.getElementById("Buser")

const turnResults = document.getElementById("turnResults")
const inductanceResults = document.getElementById("inductanceResults")
const coreLossResults = document.getElementById("coreLossResults")

const primaryWire = document.getElementById("primaryWire")
const secondaryWire = document.getElementById("secondaryWire")

const strandResult = document.getElementById("strandResult")
const copperLossResults = document.getElementById("copperLossResults")

const designChecks = document.getElementById("designChecks")
const pdfBtn = document.getElementById("pdfBtn")

const coreImage = document.getElementById("coreImage")

// CORE BUTTON CLICK
document.querySelectorAll(".core-btn").forEach(button => {

button.addEventListener("click", () => {

let core = button.dataset.core

coretype.value = core

coreImage.src = "./Pictures/" + core.toLowerCase() + ".png"

document.querySelectorAll(".core-btn").forEach(b=>{
b.classList.remove("selected-core")
})

button.classList.add("selected-core")

})

})


// MAIN CORE SELECTION
window.calculate = function(){

let Vin = parseFloat(vin.value)
let freqk = parseFloat(freq.value)
let P = parseFloat(power.value)

let result = calculateCoreSelection(
Vin,
freqk,
P,
material.value,
coretype.value
)

selectedCore.innerHTML = ""

result.cores.forEach(c=>{

let opt = document.createElement("option")
opt.text = c.name
opt.value = c.name

selectedCore.appendChild(opt)

})

let Ap = result.Ap ? result.Ap.toFixed(2) : "N/A"
let skin = result.skinDepth ? result.skinDepth.toFixed(3) : "N/A"

calcResults.innerHTML =
`
Minimum Area Product: ${Ap} cm⁴<br>
Possible Cores:<br>${result.list || "None"}<br>
Skin Depth: ${skin} mm
`

populateWire()

}


// SHOW CORE MATERIAL INFO
window.showCoreInfo = function(){

let mat = materials[material.value]

coreInfo.innerHTML=
`
Curie Temperature: ${mat.curie} °C<br>
Maximum Flux Density: ${mat.bmax} T
`

}


// TURNS + INDUCTANCE + CORE LOSS
window.calculateTurns = function(){

let core = cores[coretype.value]
.find(c => c.name === selectedCore.value)

let Vin = parseFloat(vin.value)
let Vout = parseFloat(vout.value)
let f = parseFloat(freq.value) * 1000
let B = parseFloat(Buser.value)

if(isNaN(Vin) || isNaN(Vout) || isNaN(f) || !core){
turnResults.innerHTML = "Enter valid Vin, Vout, Frequency and calculate core first"
return
}

let turns = calculateTurns(
Vin,
Vout,
f,
B,
core
)

resultsData.Np = turns.Np
resultsData.Ns = turns.Ns

turnResults.innerHTML =
`Primary Turns: ${turns.Np}<br>
Secondary Turns: ${turns.Ns}`


// Magnetizing inductance
let inductance = calculateInductance(turns.Np, core)

inductanceResults.innerHTML =
`Magnetizing Inductance: ${inductance.toFixed(2)} µH`


// Core loss
let coreLoss = calculateCoreLoss(
material.value,
parseFloat(freq.value),
parseFloat(Buser.value)
)

coreLossResults.innerHTML =
`Core Loss Density: ${coreLoss.toFixed(3)} W/cm³`

resultsData.coreLoss = coreLoss

}


// POPULATE AWG LIST
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


// STRAND + COPPER LOSS + WINDOW FILL
window.calculateStrands = function(){

let core = cores[coretype.value]
.find(c=>c.name===selectedCore.value)

let Vin = parseFloat(vin.value)
let Vout = parseFloat(vout.value)
let P = parseFloat(power.value)

let Ip = P / Vin
let Is = P / Vout

let wireP = parseFloat(primaryWire.value)
let wireS = parseFloat(secondaryWire.value)

let freqk = parseFloat(freq.value)


// Strand calculation using module
let strandPrimary = calculateStrands(wireP, freqk)
let strandSecondary = calculateStrands(wireS, freqk)

let strandsP = strandPrimary.strands
let strandsS = strandSecondary.strands


// Copper loss
let loss = calculateCopperLoss(
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

strandResult.innerHTML =
`
Skin Depth: ${strandPrimary.skinDepth.toFixed(3)} mm<br>
Primary Strands: ${strandsP}<br>
Secondary Strands: ${strandsS}
`

copperLossResults.innerHTML =
`
Primary Current: ${Ip.toFixed(2)} A<br>
Secondary Current: ${Is.toFixed(3)} A<br>
Copper Loss: ${loss.toFixed(3)} W
`


// Window fill
let fill = calculateWindowFill(
resultsData.Np,
resultsData.Ns,
wireP,
wireS,
strandsP,
strandsS,
core
)

designChecks.innerHTML =
`
Window Fill Factor: ${(fill*100).toFixed(2)} %<br>
Recommended: < 40 %
`


// Thermal
let thermal = calculateThermal(loss,resultsData.coreLoss,core)

designChecks.innerHTML +=
`<br>Estimated Temperature Rise: ${thermal.temperature.toFixed(1)} °C`

pdfBtn.style.display="block"

}


// PDF EXPORT
window.generatePDF = function(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Transformer Design Report",20,20)

doc.save("transformer_design.pdf")

}