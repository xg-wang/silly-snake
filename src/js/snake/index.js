import _ from 'lodash'
import { CONFIG } from './config'
import {
  opposite, hitTestRectangle
} from './utils'
import { Apple } from './apple'
import { Manager } from './manager'

const {
  worldSize, gridSize, snakeColor, headColor
} = CONFIG

class AbstractMap {
  constructor() {
    this.rows = Math.floor(worldSize.h / gridSize.h)
    this.cols = Math.floor(worldSize.w / gridSize.w)
    this.map = new Array(this.rows * this.cols)
    this.map.fill(false)
  }
  setPosition(pos, value = true) {
    const row = Math.floor(pos.y / gridSize.h)
    const col = Math.floor(pos.x / gridSize.w)
    this.map[this.cols * row + col] = value
  }
  snakeMove(headPos, tailPos) {
    this.setPosition(headPos, true)
    this.setPosition(tailPos, false)
  }
  checkPos(pos) {
    const row = Math.floor(pos.y / gridSize.h)
    const col = Math.floor(pos.x / gridSize.w)
    return this.map[this.cols * row + col]
  }
}

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
    this.abstractMap = new AbstractMap()
    this.abstractMap.setPosition(this.head.position)
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
    this.abstractMap.snakeMove(this.head.position, this.tail.position)
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
    this.abstractMap.setPosition(pos)
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
      if (this.abstractMap.checkPos(this.head.position)) {
        hit = true
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

export { Snake, Apple, Manager, CONFIG }
