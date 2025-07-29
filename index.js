let coffeeMachineState = {
  isProperlyShutdown: true,
  totalCupsConsumed: 0
}

const waterSlider = document.getElementById("water-slider")
const beanSlider = document.getElementById("bean-slider")
const milkSlider = document.getElementById("milk-slider")
const chamberSlider = document.getElementById("chamber")
const dispenserSlider = document.getElementById("dispenser")

const waterLevelDisplay = document.getElementById("water-level-display")
const beanLevelDisplay = document.getElementById("bean-level-display")
const milkLevelDisplay = document.getElementById("milk-level-display")
const chamberLevelDisplay = document.getElementById("chamber-level")
const dispenserLevelDisplay = document.getElementById("dispenser-level")

const cupButton = document.getElementById("cup")
const carafeButton = document.getElementById("carafe")
const powerBtn = document.getElementById("power")
const refillButton = document.getElementById("refill")

const indicators = {
  purging: document.getElementById("purging-indicator"),
  heating: document.getElementById("heating-indicator"),
  grinding: document.getElementById("grinding-indicator"),
  brewing: document.getElementById("brewing-indicator"),
  dispensing: document.getElementById("dispensing-indicator")
}

const beverageRadios = {
  hotWater: document.getElementById("hot-water"),
  coffee: document.getElementById("coffee"),
  latte: document.getElementById("latte")
}

const elapsedTimeBox = document.getElementById("elapsed-time")
const totalCupsBox = document.getElementById("total-cups")

let isOperating = false
let machineOn = false

function updateTotalCups() {
  totalCupsBox.textContent = coffeeMachineState.totalCupsConsumed
}

function updateElapsedTime(elapsed) {
  const minutes = Math.floor(elapsed / 60)
  const seconds = Math.floor(elapsed % 60)
  elapsedTimeBox.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function updateLevelDisplays() {
  waterLevelDisplay.textContent = waterSlider.value
  beanLevelDisplay.textContent = beanSlider.value
  milkLevelDisplay.textContent = milkSlider.value
  chamberLevelDisplay.textContent = chamberSlider.value
  dispenserLevelDisplay.textContent = dispenserSlider.value
}

async function runProcess(processName, duration, chamberLevel = 0, dispenserLevel = 0) {
  const indicator = indicators[processName]
  if (indicator) {
    indicator.classList.add("active")
    chamberSlider.value = chamberLevel
    dispenserSlider.value = dispenserLevel
    updateLevelDisplays()
    await new Promise(resolve => setTimeout(resolve, duration))
    indicator.classList.remove("active")
  }
}

function getSelectedBeverage() {
  if (beverageRadios.hotWater.checked) return "hotWater"
  if (beverageRadios.coffee.checked) return "coffee"
  if (beverageRadios.latte.checked) return "latte"
  return null
}

function canMakeBeverage(beverage, isCarafe) {
  const multiplier = isCarafe ? 4 : 1
  const requiredWater = 5 * multiplier
  const requiredBeans = (beverage === "coffee" || beverage === "latte") ? 5 * multiplier : 0
  const requiredMilk = beverage === "latte" ? 5 * multiplier : 0

  const water = parseInt(waterSlider.value, 10)
  const beans = parseInt(beanSlider.value, 10)
  const milk = parseInt(milkSlider.value, 10)

  return (water >= requiredWater && beans >= requiredBeans && milk >= requiredMilk)
}

function useIngredient(slider, amount) {
  const currentValue = parseInt(slider.value, 10)
  if (currentValue >= amount) {
    slider.value = currentValue - amount
    return true
  }
  return false
}

async function prepareBeverage(beverage, isCarafe) {
  if (isOperating || !machineOn) return
  isOperating = true
  const multiplier = isCarafe ? 4 : 1
  const start = Date.now()

  if (beverage === "hotWater") {
    const waterUnits = 5 * multiplier
    useIngredient(waterSlider, waterUnits)
    await runProcess("dispensing", 3000, 0, waterUnits)
  } else if (beverage === "coffee" || beverage === "latte") {
    const waterUnits = 5 * multiplier
    const beanUnits = 5 * multiplier
    const milkUnits = beverage === "latte" ? 5 * multiplier : 0

    useIngredient(beanSlider, beanUnits)
    await runProcess("grinding", 2000, beanUnits, 0)

    useIngredient(waterSlider, waterUnits)
    if (beverage === "latte") {
      useIngredient(milkSlider, milkUnits)
    }

    const totalChamberContent = beanUnits + waterUnits + milkUnits
    await runProcess("brewing", 3000, totalChamberContent, 0)
    await runProcess("dispensing", 3000, 0, totalChamberContent)
  }

  coffeeMachineState.totalCupsConsumed += multiplier
  updateTotalCups()

  const elapsed = (Date.now() - start) / 1000
  updateElapsedTime(elapsed)
  isOperating = false
}

async function powerOn() {
  machineOn = true
  isOperating = true
  powerBtn.textContent = "OFF"

  const start = Date.now()

  if (!coffeeMachineState.isProperlyShutdown) {
    await runProcess("purging", 2000, 0, 0)
  }
  await runProcess("heating", 3000, 0, 0)

  coffeeMachineState.isProperlyShutdown = false

  const elapsed = (Date.now() - start) / 1000
  updateElapsedTime(elapsed)
  isOperating = false
}

function powerOff() {
  coffeeMachineState.isProperlyShutdown = !isOperating
  machineOn = false
  isOperating = false
  powerBtn.textContent = "ON"

  Object.values(indicators).forEach(indicator => {
    indicator.classList.remove("active")
  })

  Object.values(beverageRadios).forEach(radio => {
    radio.checked = false
  })

  elapsedTimeBox.textContent = "00:00"
  chamberSlider.value = 0
  dispenserSlider.value = 0
  updateLevelDisplays()
}

function refillAll() {
  waterSlider.value = 100
  beanSlider.value = 100
  milkSlider.value = 100
  updateLevelDisplays()
}

powerBtn.addEventListener("click", async () => {
  if (powerBtn.textContent === "ON") {
    await powerOn()
  } else {
    powerOff()
  }
})

cupButton.addEventListener("click", async () => {
  const beverage = getSelectedBeverage()
  if (beverage) {
    await prepareBeverage(beverage, false)
  }
})

carafeButton.addEventListener("click", async () => {
  const beverage = getSelectedBeverage()
  if (beverage) {
    await prepareBeverage(beverage, true)
  }
})

refillButton.addEventListener("click", refillAll)

const sliderElements = [chamberSlider, dispenserSlider].filter(Boolean)

sliderElements.forEach(slider => {
  slider.addEventListener("input", () => {
    updateLevelDisplays()
  })
})

window.addEventListener("DOMContentLoaded", () => {
  updateTotalCups()
  updateLevelDisplays()
})