export function calculateTurns(Vin,Vout,freq,B,Ae){

let Np = Vin/(4*freq*B*Ae)

let Ns = Np*(Vout/Vin)

return {

Np:Math.round(Np),
Ns:Math.round(Ns)

}

}