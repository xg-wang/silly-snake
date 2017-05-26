import _ from 'lodash'
import * as CONFIG from './config'
import {
  opposite, hitTestRectangle
} from './utils'

const {
  worldSize, gridSize, snakeColor
} = CONFIG

class Snake extends PIXI.Container {
  constructor(renderer) {
    super()
    // setup
    this.time = 0
    this.direction = 'down'
    this._texture = this._generateTex(renderer, snakeColor)
    this.body = []
    this.head = this._createSquare()
    // Starting position
    this.head.position.set(worldSize.w / 2, worldSize.h / 2)
    this.addChild(this.head)
  }

  _generateTex(renderer, color) {
    const square = new PIXI.Graphics()
    square.beginFill(color)
    square.drawRect(0, 0, gridSize.w, gridSize.h)
    square.endFill()
    return renderer.generateTexture(square)
  }
  _createSquare() {
    return new PIXI.Sprite(this._texture)
  }

  move(dir) {
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

  grow(pos) {
    const tail = this._createSquare()
    tail.position.copy(pos)
    this.body.push(tail)
    this.addChild(tail)
  }

  hitSelf(head) {
    for (let s of this.body) {
      if (hitTestRectangle(head, s)) {
        return true
      }
    }
    return false
  }

  nextDirection(dir) {
    // TODO: combine learning
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
    // let safeDirs = dirs.filter(d => {

    // })
    return _.sample(dirs)

  }

  update(delta) {
    if ((this.time += delta )> 20) {
      this.time = 0
    }
    if (this.time === 0) {
      this.direction = this.nextDirection(this.direction)
      const pos = this.tail.position
      // TODO: grow when eat
      if (this.children.length < 10) {
        this.grow(pos)
      }
      this.move(this.direction)
    }
  }
}

export { Snake, CONFIG }
