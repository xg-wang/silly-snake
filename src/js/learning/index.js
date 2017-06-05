import _ from 'lodash'
import {
  opposite, DIRECTIONS
} from '../snake/utils'

class QLearner {
  constructor(snake, apple) {
    this.snake = snake
    this.apple = apple
    this.explorationRate = 0.4
    this.score = 0
    this.restartCount = 0
    this.iterations = 0
    this.oldQValue = 0
    this.currQValue = 0
    this.learnRate = 0.001
    this.gamma = 0.95
  }

  iterate() {
    this.iterations = this.iterations + 1

    const currDir = this.snake.direction
    let dirs = DIRECTIONS.slice()
    _.pull(dirs, opposite(currDir))

    if (Math.random() > this.explorationRate) {
      return this.directionFromMaxQValue(dirs)
    } else {
      const randDir = _.sample(dirs)
      this.currQValue = this.getQValue(randDir)
      return randDir
    }
  }

  updateQ(state) {
    let rwd = this.reward(state)
    this.oldQValue += this.learnRate * (rwd + this.gamma * this.currQValue - this.oldQValue)
  }

  reward(state) {
    if (state == 'eat') {
      // apple become a part of body, need to rewrite grow()
      // this.snake.grow(this.snake.head)
      // check apple position, apple cannot be on snake body
      // this.apple.moveTo(this.nextApplePosition)
      this.explorationRate = this.explorationRate / 3
      this.score = this.score + 1
      this.restartCount = 0
      return 1000.0
    }
    else if (state == 'eat_self') {
      this.score = 0
      this.restartCount = 0
      // this.snake.reset()
      this.restartCount = this.restartCount + 1
      return -100000.0
    }
    else if (state == 'out') {
      // this.snake.reset()
      this.restartCount = this.restartCount + 1
      return -1000.0
    }

    if (this.restartCount > 50) {
      this.explorationRate = 0.2
    }

    let rwd = Math.sqrt((this.snake.head.position.x - this.apple.position.x) * (this.snake.head.position.x -
    this.apple.position.x) + (this.snake.head.position.y - this.apple.position.y) * (this.snake.head.position.y -
    this.apple.position.y))

    return -rwd
  }

  getQValue(dir) {
    // const headPos = this.snake.head.position.clone()
    const headPos = { position: {x: this.snake.head.position.x, y: this.snake.head.position.y} }
    this.snake.toNextDirection(headPos, dir)
    return -Math.sqrt(
      Math.pow((headPos.position.x - this.apple.position.x), 2) +
      Math.pow((headPos.position.y - this.apple.position.y), 2)
    )
  }

  directionFromMaxQValue(dirs) {
    const qValues = dirs.map(d => this.getQValue(d))
    this.currQValue = _.max(qValues)
    return dirs[qValues.indexOf(this.currQValue)]
  }

}

export { QLearner }
