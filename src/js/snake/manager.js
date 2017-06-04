import { CONFIG } from './config'

const {
  worldSize, gridSize
} = CONFIG

class Manager {
  constructor(app, snake, apple) {
    this.app = app
    this.snake = snake
    this.apple = apple
    this.apple.moveTo(this.nextApplePosition())
    this.app.stage.addChild(snake, apple.sprite)
  }

  update(delta) {
    const state = this.snake.update(delta, this.apple.position)
    switch (state) {
      case 'end':
        this.snake.reset()
      case 'eat':
        const newPos = this.nextApplePosition()
        this.apple.moveTo(newPos)
        break
      default:
        break
    }
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }
}

export { Manager }
