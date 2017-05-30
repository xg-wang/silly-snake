import * as PIXI from 'pixi.js'
import { Snake, Apple, Manager, CONFIG } from './snake'

const {
  worldSize, gridSize, backgroundColor
} = CONFIG

const app = new PIXI.Application(
  worldSize.w, worldSize.h,
  {backgroundColor: backgroundColor}
)
document.body.appendChild(app.view)

PIXI.loader
  .add('../assets/snakeset.png')
  .load(setup)

function setup() {
  console.log('setup')
  const snake = new Snake(app.renderer)
  const apple = new Apple()
  const manager = new Manager(app, snake, apple)

  app.ticker.add((delta) => {
    manager.update(delta)
  })
}
