import _ from 'lodash'
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
    this.time = 0
    this.direction = 'down'
    this.bodySize = 1
    this.body = []
    this.head = new Square(snakeColor)
    this.head.position.set(worldSize.w / 2, worldSize.h / 2)
    this.addChild(this.head)
  }

  move(dir) {
    console.log(this.head.position);
    let prev = this.head.position;
    switch (dir) {
      case 'up':
        this.head.position.y -= gridSize.h
        break
      case 'down':
        this.head.position.y += gridSize.h
        break
      case 'left':
        this.head.position.x -= gridSize.w
        break
      case 'right':
        this.head.position.x += gridSize.w
        break
      default:
        console.error('dir input not supported!', dir)
        break
    }
    for (let s of this.body) {
      const curr = { x: s.x, y: s.y }
      s.position.copy(prev);
      prev = curr;
    }
  }

  get size() {
    return this.children.length;
  }
  get tail() {
    return this.children[this.children.length - 1]
  }

  nextDirection(dir) {
    let dirs = ['up', 'down', 'left', 'right']
    switch (dir) {
      case 'up':
        dirs.splice(0, 1)
        break
      case 'down':
        dirs.splice(1, 1)
        break
      case 'left':
        dirs.splice(2, 1)
        break
      case 'right':
        dirs.splice(3, 1)
        break
      default:
        console.error('dir input not supported!', dir)
        break
    }
    return _.sample(dirs)
  }

  grow(pos) {
    const tail = new Square()
    tail.position.copy(pos)
    this.body.push(tail)
    this.addChild(tail)
  }

  update(delta) {
    if ((this.time += delta )> 20) {
      this.time = 0
    }
    if (this.time === 0) {
      this.direction = this.nextDirection(this.direction)
      this.move(this.direction)
      const pos = this.tail.position
      this.grow(pos)
    }
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
