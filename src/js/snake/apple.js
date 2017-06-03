import { CONFIG } from './config'

const {
  gridSize
} = CONFIG

class Apple {
  constructor() {
    const texture = PIXI.loader.resources[
      '../assets/snakeset.png'
    ].texture
    // texture.frame = new PIXI.Rectangle(256-64, 192-64, 64, 64);
    const w = 14
    texture.frame = new PIXI.Rectangle(256-64+w, 192-64+w, 64-w*2, 64-w*2);
    this.sprite = new PIXI.Sprite(texture)
    this.sprite.width = gridSize.w
    this.sprite.height = gridSize.h
    this.moveTo({x: 0, y: 0})
  }

  moveTo(pos) {
    this.sprite.position = pos
  }

  get position() {
    return this.sprite.position
  }
}

export { Apple }
