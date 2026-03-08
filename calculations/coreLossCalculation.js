export function calculateCoreLoss(materialName, freq, B){

let mat = materials[materialName]

let k = mat.k
let a = mat.a
let b = mat.b

let f = freq * 1000

let loss = k * Math.pow(f,a) * Math.pow(B,b)

return loss

}