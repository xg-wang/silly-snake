class Apple {
  constructor() {
    const texture = PIXI.loader.resources[
      '../assets/snakeset.png'
    ].texture
    texture.frame = new PIXI.Rectangle(192, 128, 64, 64);
    this.sprite = new PIXI.Sprite(texture)
    this.moveTo({x: 0, y: 0})
  }

  moveTo(pos) {
    this.sprite.position = pos
  }
}

export { Apple }
