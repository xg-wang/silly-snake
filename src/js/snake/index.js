import * as CONFIG from './config'
import {
  opposite
} from './utils'

const {
  worldSize, gridSize, snakeColor
} = CONFIG

class Snake extends PIXI.Container {
  constructor(...args) {
    super(...args)
    // setup
    this.direction = 'down'
    this.bodySize = 1
    this.body = []
    this.head = new Square(snakeColor)
    this.addChild(this.head, ...this.body)
    console.log(this)

    this.position.set(worldSize.w / 2, worldSize.h / 2)
  }

  update(delta) {
    // console.log(delta)
  }
}

class Square extends PIXI.Sprite {
  constructor(color) {
    super()
    this.square = new PIXI.Graphics()
    this.square.beginFill(color)
    this.square.drawRect(0, 0, gridSize.w, gridSize.h)
    this.square.endFill()
    this.addChild(this.square)
  }
}

export { Snake, CONFIG }
