export function calculateCoreSelection(Vin,freq,power,material,coreList){

let Ku = 0.4
let J = 4e6
let Bmax = material.bmax

let Ap = power /(Ku*J*Bmax*freq)

let suitableCores=[]

for(let c of coreList){

if(c.Ap >= Ap*1e8){

suitableCores.push(c)

}

}

return {
areaProduct:Ap*1e8,
cores:suitableCores
}

}