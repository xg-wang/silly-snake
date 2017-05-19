const PIXI = require('pixi.js')

// config
const worldSize = {w: 800, h: 600}
    , gridSize  = {w: 20, h: 20}
    , backgroundColor = 0x779966

const app = new PIXI.Application(800, 600, {backgroundColor: backgroundColor})
document.body.appendChild(app.view)


