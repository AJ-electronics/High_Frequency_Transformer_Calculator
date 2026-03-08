export function calculateCoreLoss(freq,B,material){

let k = material.k
let a = material.a
let b = material.b

let loss = k*Math.pow(freq,a)*Math.pow(B,b)

return loss

}