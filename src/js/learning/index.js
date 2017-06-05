class QLearner {
  constructor(snake, apple) {
    this.snake = snake
    this.apple = apple
    this.explorationRate = 40
    this.score = 0
    this.restartCount = 0
    this.iterations = 0
    this.oldQvalue = 0.0
    this.learnRate = 0.001
    this.gamma = 0.9
  }

  iterate() {
    this.iterations = this.iterations + 1

    let newQvalue = 0.0
    if (getRandomInt(0, 100) > this.explorationRate) {
      newQvalue = this.maxQValue()
    }
    else {
      num = getRandomInt(0, 4)
      // point: pos
      if (num == 0) {
        // pos = upPos
      }
      else if (num == 1) {
        // pos = downPos
      }
      else if (num == 2) {
        // pos = leftPos
      }
      else {
        // pos = rightPos
      }
    }
  }

  updateQ(state) {
    // let newQvalue = this.getQValue(pos)
    // let rwd = this.reward()
    // this.oldQvalue += this.learnRate * (rwd + this.gamma * newQvalue - this.oldQvalue)
  }

  reward() {
    // if (this.snake.head.position.x== this.apple.position.x && this.snake.head.position.y == this.apple.position.y) {
    //   // apple become a part of body, need to rewrite grow()
    //   this.snake.grow(this.snake.head)

    //   // check apple position, apple cannot be on snake body
    //   this.apple.moveTo(this.nextApplePosition)
    //   this.explorationRate = this.explorationRate / 3
    //   this.score = this.score + 1
    //   this.restartCount = 0
    //   return 1000.0
    // }
    // else if (checkEncounterBody()) {
    //   this.score = 0
    //   this.restartCount = 0
    //   // restart()
    //   this.restartCount = this.restartCount + 1
    //   return -100000.0
    // }
    // else if (checkEncounterWall()) {
    //   // restart
    //   this.restartCount = this.restartCount + 1
    //   return -1000.0
    // }

    // if (this.restartCount > 50) {
    //   this.explorationRate = 20
    // }

    // rwd = sqrt((this.snake.head.position.x - this.apple.position.x) * (this.snake.head.position.x -
    //   this.apple.position.x) + (this.snake.head.position.y - this.apple.position.y) * (this.snake.head.position.y -
    //   this.apple.position.y))

    // return -rwd
  }

  getQValue(pos) {
    return Math.sqrt(
      Math.pow((pos.position.x - this.apple.position.x), 2) +
      Math.pow((pos.position.y - this.apple.position.y), 2)
    )
  }

  maxQValue() {
    let newQvalue = 0.0

    //new four points: upPos, downPos, leftPos, rightPos
    // checkEncounterBody

    //upQvalue = getQValue(upPos)

    //downQvalue = getQValue(downPos)

    //leftQvalue = getQValue(leftPos)

    //rightQvalue = getQValue(rightPos)

    // newQvalue = max(upQvalue, downQvalue, leftQvalue, rightQvalue)
    return newQvalue
  }


}

export { QLearner }
