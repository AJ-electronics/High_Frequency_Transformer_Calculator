export function calculateCoreLoss(materialName, freq, B){

let mat = materials[materialName]

let k = mat.k
let a = mat.a
let b = mat.b

// freq already in kHz
let loss = k * Math.pow(freq,a) * Math.pow(B,b)

return loss

}