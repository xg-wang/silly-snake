import _ from 'lodash'
import { CONFIG } from './config'
import {
  opposite, getRandomInt
} from './utils'
import { Apple } from './apple'

const {
  worldSize, gridSize, snakeColor, headColor, backgroundColor, eatSelfReward, eatAppleReward, moveReward
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
  pointFromIdx(idx) {
    const col = idx % this.cols
    const row = Math.floor(idx / this.cols)
    return {
      x: col * gridSize.h,
      y: row * gridSize.w
    }
  }
  get size() {
    return this.map.length
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
    this.renderer = renderer
  }

  _generateTex(renderer, color) {
    const radius = Math.min(gridSize.w, gridSize.h) / 10
    const lineWidth = Math.min(gridSize.w, gridSize.h) / 10
    const square = new PIXI.Graphics()
    square.lineStyle(lineWidth, backgroundColor, 1);
    square.beginFill(color)
    square.drawRoundedRect(0, 0, gridSize.w, gridSize.h, radius)
    square.endFill()
    return renderer.generateTexture(square)
  }
  _createSquare(t) {
    return new PIXI.Sprite(t)
  }

  move(dir) {
    const p = this.head.position
    let prev = new PIXI.Point(p.x, p.y)
    this._toNextDirection(this.head, dir)
    if (this.abstractMap.checkPos(this.head.position)) {
      return eatSelfReward // -10000 reward if eat itself
    }
    this.abstractMap.snakeMove(this.head.position, this.tail.position)
    for (let s of this.body) {
      const curr = { x: s.x, y: s.y }
      s.position.copy(prev);
      prev = curr;
    }
    return moveReward // 0 reward for just moving around
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

  /**
   * Use RL to decide which direction snake should take
   *
   * @param {'up'|'down'|'left'|'right'} dir
   * @param {{x: number, y: number}} applePos
   * @returns {'up'|'down'|'left'|'right'}
   *
   * @memberof Snake
   */
  selectNextDirection(dir, applePos, a) {
    // TODO: combine learning
    if (a) {
      switch(this.direction) {
        case 'up':
          if (a == 0) return 'up'
          if (a == 1) return 'left'
          if (a == 2) return 'right'
          break
        case 'down':
          if (a == 0) return 'down'
          if (a == 1) return 'right'
          if (a == 2) return 'left'
          break
        case 'left':
          if (a == 0) return 'left'
          if (a == 1) return 'down'
          if (a == 2) return 'up'
          break
        case 'right':
          if (a == 0) return 'right'
          if (a == 1) return 'up'
          if (a == 2) return 'down'
          break
        default:
          console.error('dir input not supported!', dir)
          break
      }
      console.log('action input not supported', a)
    }
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

  update(delta, applePos, a) {
    if ((this.time += delta )> 20) {
      this.time = 0
    }
    if (this.time === 0) {
      this.direction = this.selectNextDirection(this.direction, applePos, a)
      const pos = new PIXI.Point(this.tail.position.x, this.tail.position.y)
      let reward = this.move(this.direction)
      // TODO: grow when eat
      if (reward == moveReward && this.eatApple(applePos)) {
        this.grow(pos);
        return eatAppleReward; // huge reward
      }
      return reward;
    }
  }

  /**
   * @returns Point?
   */
  randomEmptyPosition() {
    const emptyNum = this.abstractMap.size - this.size
    if (emptyNum === 0) {
      return null
    }
    let randomIdx = getRandomInt(0, emptyNum)
    for (let i = 0; i < this.abstractMap.size; i++) {
      if (randomIdx === 0) {
        return this.abstractMap.pointFromIdx(i)
      } else if (!this.abstractMap.map[i]) {
        randomIdx--
      }
    }
  }
  eatApple(applePos) {
    return this.abstractMap.checkPos(applePos)
  }
}

export { Snake, Apple, CONFIG }
