class Manager {
  constructor(app, snake, apple) {
    this.app = app
    this.snake = snake
    this.apple = apple
    this.app.stage.addChild(snake, apple.sprite)
  }

  update(delta) {
    this.snake.update(delta)
  }
}

export { Manager }
