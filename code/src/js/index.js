import * as PIXI from 'pixi.js'
import { Snake, Apple, Manager, CONFIG } from './snake'

const {
  worldSize, gridSize, backgroundColor
} = CONFIG

const app = new PIXI.Application(
  worldSize.w, worldSize.h,
  {backgroundColor: backgroundColor}
)
const wrapper = document.querySelector('#wrapper')
const speed = document.querySelector('#speed')
wrapper.insertBefore(app.view, speed)

PIXI.loader
  .add('assets/snakeset.png')
  .load(setup)

function setup() {
  console.log('setup')
  const snake = new Snake(app.renderer)
  const apple = new Apple()
  const manager = new Manager(app, snake, apple)

  app.ticker.add((delta) => {
    manager.update(delta)
  })

  speed.addEventListener('input', function(event) {
    manager.inverseSpeed = 60 / this.value
    console.log(manager.inverseSpeed)
  })

}