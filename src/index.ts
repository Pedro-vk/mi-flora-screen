const i2c = require('i2c-bus')
const Oled = require('oled-rpi-i2c-bus')
const font = require('oled-font-5x7')

import { Mqtt } from './shared';

interface FlowerCareData {
  light: number;
  temperature: number;
  moisture: number;
  conductivity: number;
  battery: number;
}

const drop = '\u0100'
const warn = '\u0101'

// Inject new fonts
font.fontData.push(
  0b0110000,
  0b1111100,
  0b1011111,
  0b1001100,
  0b0110000,
)
font.lookup.push(drop)
font.fontData.push(
  0b0000000,
  0b1101111,
  0b1101111,
  0b1101111,
  0b0000000,
)
font.lookup.push(warn)

;(async () => {
  const w = 128
  const h = 32
  const opts = {
    width: w,
    height: h,
    address: 0x3C,
    bus: 1,
    driver: "SSD1306"
  }

  const i2cBus = i2c.openSync(opts.bus)
  const oled = new Oled(i2cBus, opts)
  const mqtt = Mqtt.getInstance();

  const forceClear = () => oled.fillRect(0, 0, w, h, 0)
  const drawBorder = (b = 1) => {
    oled.fillRect(0, 0, w, h, 1)
    oled.fillRect(b, b, w - b * 2, h - b * 2, 0)
  }

  const mifloraStatus = {
    FC1: {
      light: 71,
      temperature: 27.5,
      moisture: 44,
      conductivity: 716,
      battery: 37
    },
    FC2: {
      light: 71,
      temperature: 27.5,
      moisture: 21,
      conductivity: 716,
      battery: 20
    },
  }

  mqtt.subscribe('miflora/FC1', (_: any) => mifloraStatus.FC1 = _)
  mqtt.subscribe('miflora/FC2', (_: any) => mifloraStatus.FC2 = _)

  const drawPartial = (y: number, name: string, data: FlowerCareData) => {
    const xs = 10
    const xe = w - xs
    const chars = n => n * (font.width + 1)
    oled.battery(xs, y, data.battery)
    oled.setCursor(xs + 22, y + 2)
    oled.writeString(font, 1, name, 1, false)

    const right = `${warn} ${String(data.moisture)}% ${drop}`
    oled.setCursor(xe - chars(right.length), y + 2)
    oled.writeString(font, 1, right, 1, false)
  }

  const updateView = () => {
    const lineHeight = 12;
    const border = 2;
    const separation = 1;
    drawBorder(border);
    const middle = h / 2;
    const line1 = middle - lineHeight - separation
    const line2 = middle + separation
    drawPartial(line1, 'FC1', mifloraStatus.FC1)
    drawPartial(line2, 'FC2', mifloraStatus.FC2)
  }

  updateView()

  await new Promise(_ => setTimeout(_, 3 * 1000))
  console.log(2)

  await new Promise(_ => setTimeout(_,60 * 1000))
  console.log(3)
  oled.turnOffDisplay()

  await new Promise(_ => setTimeout(_, 1000))
  await new Promise(_ => setTimeout(_, 20 * 60 * 1000))
})()
  .catch(_ => console.log(_))


