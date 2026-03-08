export function calculateCoreLoss(material, freq, B){

let k = material.k
let a = material.a
let b = material.b

let loss = k * Math.pow(f/1000,a) * Math.pow(B,b)

return loss

}