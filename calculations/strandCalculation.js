export function calculateStrands(wireDiameter, frequency){

// copper constants
const rho = 1.72e-8
const mu0 = 4 * Math.PI * 1e-7

// convert frequency to Hz
let f = frequency * 1000

// skin depth (meters)
let skin = Math.sqrt(rho/(Math.PI * f * mu0))

// convert to mm
skin *= 1000

// maximum usable strand diameter
let maxDiameter = 2 * skin

// cross-section areas
let areaWire = Math.PI * (wireDiameter/2)**2
let areaSkin = Math.PI * (maxDiameter/2)**2

// strands required
let strands = Math.max(1, Math.ceil(areaWire / areaSkin))

return {
skinDepth: skin,
maxStrandDiameter: maxDiameter,
strands: strands
}

}