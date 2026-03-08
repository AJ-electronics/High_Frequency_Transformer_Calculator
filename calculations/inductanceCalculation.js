export function calculateInductance(Np,Ae,le){

let mu0 = 4*Math.PI*1e-7
let mur = 2000

let L = (mu0*mur*Np*Np*Ae)/le

return L

}