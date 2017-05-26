import _ from 'lodash'
import { CONFIG } from './config'
import {
  opposite, hitTestRectangle
} from './utils'

const {
  worldSize, gridSize, snakeColor, headColor
} = CONFIG

class Snake extends PIXI.Container {
  constructor(renderer) {
    super()
    // setup
    this.time = 0
    this.direction = 'down'
    this._bodyTexture = this._generateTex(renderer, snakeColor)
    this._headTexture = this._generateTex(renderer, headColor)
    this.body = []
    this.head = this._createSquare(this._headTexture)
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
  _createSquare(t) {
    return new PIXI.Sprite(t)
  }

  move(dir) {
    const p = this.head.position
    let prev = new PIXI.Point(p.x, p.y);
    this._toNextDirection(this.head, dir)
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
    const tail = this._createSquare(this._bodyTexture)
    tail.position.set(pos.x, pos.y)
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

  selectNextDirection(dir) {
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
    let safeDirs = dirs.filter(d => {
      let hit = false
      // attemp
      this._toNextDirection(this.head, d)
      for (let i = 0; i < this.body.length - 1; i++) {
        if (hitTestRectangle(this.head, this.body[i])) {
          hit = true
          break
        }
      }
      // recover
      this._toNextDirection(this.head, opposite(d))
      return !hit
    })
    return _.sample(safeDirs)
  }
  _toNextDirection(head, dir) {
    switch (dir) {
      case 'up':
        head.position.y -= gridSize.h
        break
      case 'down':
        head.position.y += gridSize.h
        break
      case 'left':
        head.position.x -= gridSize.w
        break
      case 'right':
        head.position.x += gridSize.w
        break
      default:
        console.error('dir input not supported!', dir)
        break
    }
  }

  update(delta) {
    if ((this.time += delta )> 20) {
      this.time = 0
    }
    if (this.time === 0) {
      this.direction = this.selectNextDirection(this.direction)
      const pos = new PIXI.Point(this.tail.position.x, this.tail.position.y)
      this.move(this.direction)
      // TODO: grow when eat
      if (this.children.length < 10) {
        this.grow(pos)
      }
    }
  }
}

export { Snake, CONFIG }
