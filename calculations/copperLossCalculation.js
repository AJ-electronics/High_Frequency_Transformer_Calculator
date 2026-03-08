export function calculateCopperLoss(Ip,Is,Np,Ns,wireP,wireS,strandsP,strandsS,core){

let rho = 1.72e-8

let AwireP = Math.PI*(wireP/2)**2 *1e-6
let AwireS = Math.PI*(wireS/2)**2 *1e-6

let Lp = Np*core.mlt
let Ls = Ns*core.mlt

let Rp = rho*Lp/(AwireP*strandsP)
let Rs = rho*Ls/(AwireS*strandsS)

let loss = Ip*Ip*Rp + Is*Is*Rs

return loss

}