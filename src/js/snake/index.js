import * as PIXI from 'pixi.js'

class Snake extends PIXI.Container {
  constructor(...args) {
    super(...args)
    this.bodySize = 1
  }
}

export default { Snake }
