import { CONFIG } from './config'
import { QLearner } from '../learning'

const {
  worldSize, gridSize
} = CONFIG

class Manager {
  constructor(app, snake, apple) {
    this.time = 0
    this.app = app
    this.snake = snake
    this.apple = apple
    this.apple.moveTo(this.nextApplePosition())
    this.app.stage.addChild(snake, apple.sprite)
    this.learner = new QLearner(snake, apple)
    this.prevDistance = this._getDistance()
    this.inverseSpeed = 2
  }

  update(delta) {
    if ((this.time += delta) > this.inverseSpeed) {
      this.time = 0
    }
    if (this.time === 0) {
      const newDir = this.learner.selectDirection()
      let state = this.snake.update(delta, newDir, this.apple.position)
      // console.log(`dir: ${newDir}, state: ${state}`)
      switch (state) {
        case 'out':
        case 'eat_self':
          this.snake.reset()
          this.prevDistance = 0
        case 'eat':
          const newPos = this.nextApplePosition()
          this.apple.moveTo(newPos)
          break
        case 'continue':
          state = this._getDistance() > this.prevDistance ? 'move_further' : 'move_closer'
          break
        default:
          break
      }
      this.learner.updateQ(state)
    }
  }
  _getDistance(aP, sP) {
    const appleP = aP || this.apple.position
        , snakeP = sP || this.snake.head.position
    return (appleP.x - snakeP.x) ** 2 + (appleP.y - snakeP.y) ** 2
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }

}

export { Manager }
