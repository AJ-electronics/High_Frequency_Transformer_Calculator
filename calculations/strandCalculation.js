export function calculateStrands(current, frequency){

const rho = 1.72e-8
const mu0 = 4*Math.PI*1e-7

let f = frequency * 1000

// skin depth
let skin = Math.sqrt(rho/(Math.PI*f*mu0))
skin *= 1000 // mm

// choose strand diameter ~ skin depth
let strandDiameter = skin

let strandArea = Math.PI*(strandDiameter/2)**2

// current density
let J = 5 // A/mm²

let requiredArea = current / J

let strands = Math.max(1, Math.ceil(requiredArea / strandArea))

return {
skinDepth: skin,
strandDiameter: strandDiameter,
strands: strands
}

}