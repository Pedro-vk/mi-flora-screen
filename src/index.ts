const i2c = require('i2c-bus')
const Oled = require('oled-i2c-bus')
const font = require('oled-font-5x7');

(async () => {
  const opts = {
    width: 128,
    height: 32,
    address: 0x3C,
    bus: 1,
    driver:"SSD1306"
  }

  const i2cBus = i2c.openSync(opts.bus)
  const oled = new Oled(i2cBus, opts)

  oled.setCursor(1, 1);
  oled.writeString(font, 1, 'Test', 1, true);

  await new Promise(_ => setTimeout(_, 60000))

  oled.clearDisplay()
})()


