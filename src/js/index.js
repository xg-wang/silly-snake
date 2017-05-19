import * as PIXI from 'pixi.js'
import Snake from './snake'

// config
const worldSize = {w: 800, h: 600}
    , gridSize  = {w: 20, h: 20}
    , backgroundColor = 0x779966

const app = new PIXI.Application(800, 600, {backgroundColor: backgroundColor})
document.body.appendChild(app.view)

const snake = new Snake()

app.stage.addChild(snake)
