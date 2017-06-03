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
    this.snake.update(delta)
    // TODO: game end
    if (this.snake.eatApple(this.apple.position)) {
      const newPos = this.nextApplePosition()
      this.apple.moveTo(newPos)
    }
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }
}

export { Manager }
