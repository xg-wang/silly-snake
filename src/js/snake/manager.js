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
  }

  update(delta) {
    if ((this.time += delta) > 5) {
      this.time = 0
    }
    if (this.time === 0) {
      const newDir = this.learner.selectDirection()
      const state = this.snake.update(delta, newDir, this.apple.position)
      console.log(`dir: ${newDir}, state: ${state}`)
      switch (state) {
        case 'out':
        case 'eat_self':
          this.snake.reset()
        case 'eat':
          const newPos = this.nextApplePosition()
          this.apple.moveTo(newPos)
          break
        default:
          break
      }
      this.learner.updateQ(state)
    }
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }

}

export { Manager }
