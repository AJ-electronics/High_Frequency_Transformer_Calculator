export function calculateInductance(Np, core){

let Al = core.Al   // nH/turn²

let L = Al * Np * Np / 1000  // µH

return L

}