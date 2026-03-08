export function calculateInductance(Np, core){

let mu0 = 4*Math.PI*1e-7
let mur = 2000   // ferrite approx

let Ae = core.Ae
let le = core.le

let L = mu0 * mur * (Np*Np) * Ae / le

return L*1e6   // µH

}