export function calculateWindowFill(Np,Ns,wireP,wireS,strandsP,strandsS,core){

let AwireP = Math.PI*(wireP/2)**2 *1e-6
let AwireS = Math.PI*(wireS/2)**2 *1e-6

let copperArea =
Np*strandsP*AwireP +
Ns*strandsS*AwireS

let fill = copperArea/core.Aw

return fill

}