export function calculateThermal(coreLoss,copperLoss,core){

let coreVolume = core.Ae * core.le

let totalCoreLoss = coreLoss * coreVolume *1e6

let totalLoss = totalCoreLoss + copperLoss

let tempRise = totalLoss * 25

return {

loss:totalLoss,
temperature:tempRise

}

}