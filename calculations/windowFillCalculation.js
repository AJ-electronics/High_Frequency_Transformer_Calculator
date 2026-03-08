export function calculateWindowFill(Np,Ns,wireP,wireS,strandsP,strandsS,core){

let kp = 0.7

let AwireP = Math.PI * (wireP/2)**2
let AwireS = Math.PI * (wireS/2)**2

// convert mm² → m²
AwireP *= 1e-6
AwireS *= 1e-6

let copperArea =
Np * strandsP * AwireP +
Ns * strandsS * AwireS

let effectiveWindow = core.Aw * kp

let fill = copperArea / effectiveWindow

return fill

}