import * as PIXI from 'pixi.js'
import { Snake, CONFIG } from './snake'

const {
  worldSize, gridSize, backgroundColor
} = CONFIG

const app = new PIXI.Application(
  worldSize.w, worldSize.h,
  {backgroundColor: backgroundColor}
)
document.body.appendChild(app.view)

const snake = new Snake(app.renderer)

app.stage.addChild(snake)

app.ticker.add((delta) => {
  snake.update(delta)
})
