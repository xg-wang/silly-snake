import _ from 'lodash'
import { CONFIG } from './config'
import {
  opposite, getRandomInt
} from './utils'
import { Apple } from './apple'
import { Manager } from './manager'

const {
  worldSize, gridSize, snakeColor, headColor, backgroundColor
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
  /**
   * return false if move fails and game should end
   * @param {{x: number, y: number}} headPos
   * @param {{x: number, y: number}} tailPos
   * @returns {boolean}
   */
  snakeMove(headPos, tailPos) {
    this.setPosition(tailPos, false)
    if (this.checkPos(headPos)) {
      return false
    } else {
      this.setPosition(headPos, true)
    }
    return true
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
    this.direction = 'down'
    this._bodyTexture = this._generateTex(renderer, snakeColor)
    this._headTexture = this._generateTex(renderer, headColor)
    this.reset()
  }
  reset() {
    this.removeChildren()
    this.body = []
    this.head = this._createSquare(this._headTexture)
    // Starting position
    this.head.position.set(worldSize.w / 2, worldSize.h / 2)
    this.addChild(this.head)
    this.abstractMap = new AbstractMap()
    this.abstractMap.setPosition(this.head.position)
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

  /**
   * return state string if move fails and game should end
   * @param {'up'|'down'|'left'|'right'} dir
   * @returns {'out'|'eat_self'|'continue'}
   */
  move(dir) {
    const p = this.head.position
    let prev = new PIXI.Point(p.x, p.y);
    this._toNextDirection(this.head, dir)
    // check out of boundary
    if (this._checkBoundary(this.head.position)) {
      return 'out' // game end if out of boundary
    }
    if (!this.abstractMap.snakeMove(this.head.position, this.tail.position)) {
      return 'eat_self' // game end if eat self
    }
    for (let s of this.body) {
      const curr = { x: s.x, y: s.y }
      s.position.copy(prev);
      prev = curr;
    }
    return 'continue'
  }
  /**
   * @param {{x: number, y: number}} h head position
   * @returns {boolean} true if out
   */
  _checkBoundary(h) {
    return (h.x < 0 || h.y < 0 || h.x >= worldSize.w || h.y >= worldSize.h)
  }

  get size() {
    return this.children.length;
  }
  get tail() {
    return this.children[this.children.length - 1]
  }

  /**
   * Snake grows at previous tail position
   * then update the abstract map
   * @param {{x: number, y: number}} pos
   */
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
  selectNextDirection(dir, applePos) {
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

  /**
   * Return game state after update
   * @param {number} delta
   * @param {'up'|'down'|'left'|'right'} dir
   * @param {{x: number, y: number}} applePos
   * @returns {'out'|'eat_self'|'eat'|'continue'}
   */
  update(delta, dir, applePos) {
    this.direction = this.selectNextDirection(this.direction, applePos)
    const pos = new PIXI.Point(this.tail.position.x, this.tail.position.y)
    const moveResult = this.move(this.direction)
    if (moveResult !== 'continue') {
      return moveResult
    }
    // TODO: grow only when eat
    if (this.eatApple(applePos) || this.children.length < 10) {
      this.grow(pos)
      return 'eat'
    }
    return 'continue'
  }

  /**
   * @returns {Point?}
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
    return this.head.x === applePos.x && this.head.y === applePos.y
  }
}

export { Snake, Apple, Manager, CONFIG }
