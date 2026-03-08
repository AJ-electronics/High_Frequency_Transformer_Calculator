export function calculateCoreSelection(Vin, freqk, P, material, coreType)
{

// convert frequency to Hz
let f = freqk * 1000

// constants
let Bmax = 0.2
let Ku = 0.4
let J = 4e6   // current density A/m²

// Area product calculation
let Ap = (P) / (4 * Bmax * f * Ku * J)

// convert m⁴ → cm⁴
Ap = Ap * 1e8


// Skin depth calculation
let rho = 1.72e-8
let mu0 = 4 * Math.PI * 1e-7

let skinDepth =
Math.sqrt((2 * rho) / (2 * Math.PI * f * mu0))

skinDepth = skinDepth * 1000 // mm


// find suitable cores
let coreList = cores[coreType] || []

let possible = coreList.filter(c => c.Ap >= Ap)

let list = possible.map(c => c.name).join("<br>")


return {

Ap: Ap,
skinDepth: skinDepth,
cores: possible,
list: list

}

}