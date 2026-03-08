export function calculateTurns(Vin, Vout, f, B, core){

let Ae = core.Ae * 1e-4   // cm² → m²

let Np = Vin / (4 * f * B * Ae)

let ratio = Vout / Vin
let Ns = Np * ratio

return {
Np: Math.ceil(Np),
Ns: Math.ceil(Ns)
}

}