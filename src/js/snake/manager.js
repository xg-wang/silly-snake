import { CONFIG } from './config'
import { Snake, AbstractMap } from './index'

const {
  worldSize, gridSize, eatSelfReward, eatAppleReward, moveReward, getOutReward
} = CONFIG

class Manager {
  constructor(app, snake, apple) {
    this.app = app
    this.snake = snake
    this.apple = apple
    this.apple.moveTo(this.nextApplePosition())
    this.app.stage.addChild(snake, apple.sprite)
    this.highest = 0;
  }

  /**
   * @returns an integer of total number of states, used by reinforcejs
   * This state modeling takes reference from http://cs229.stanford.edu/proj2016spr/report/060.pdf
   * Essentially, the state is reduced to the relative position of the snake and the food with the current coordination of the snake.
   * Each state in the reduced space is of the form:
   * {ws, wl, wr, qfu, qfd, qtu, qtd}
   * ws: whether there is a wall straight to the head
   * wl: whether there is a wall to the left of the head
   * wr: whether there is a wall to the right of the head
   * qfu: whether food position is upper
   * qfd: whether food position is down
   * qfl: whether food position is left
   * qfr: whether food position is right
   * qtu: whether tail position is upper
   * qtl: whether tail position is left
   * In terms of actions, we have:
   * 0: forward
   * 1: left
   * 2: right
   **/
  getNumStates() {
    return 128;
  }

  decodeToStr(s) {
    var dec2bin = (dec) => {
        return (dec >>> 0).toString(2)
    }
    var str = dec2bin(s).split('').join('')
    str = Array(7 - str.length + 1).join('0') + str
    return str
  }

  decodeState(s) {
    let str = this.decodeToStr(s)
    return {
      ws: str[0] == 1,
      wl: str[1] == 1,
      wr: str[2] == 1,
      qfu: str[3] == 1,
      qfl: str[4] == 1,
      qtu: str[5] == 1,
      qtl: str[6] == 1
    };
  }

  getState(dir) {
    let head_x = this.snake.head.position._x;
    let head_y = this.snake.head.position._y;
    let tail_x = this.snake.tail.position._x;
    let tail_y = this.snake.tail.position._y;
    let apple_x = this.apple.position._x;
    let apple_y = this.apple.position._y;
    let direction = dir || this.snake.direction;
    let state = {
      ws: false,
      wl: false,
      wr: false,
      qfu: false,
      qfl: false,
      qtu: false,
      qtl: false
    };
    // get the relative position of the head and the tail
    state.qfu = apple_y <= head_y;
    state.qfl = apple_x <= head_x;
    state.qtu = tail_y <= head_y;
    state.qtl = tail_x <= head_x;

    // check if there's a wall straight/left/right to the head, be that snake's children or the boundary
    switch (direction) {
      case 'up':
        state.ws = head_y - gridSize.h < 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        state.wl = head_x - gridSize.w < 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wr = head_x + gridSize.w >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      case 'down':
        state.ws = head_y + gridSize.h >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.wr = head_x - gridSize.w < 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wl = head_x + gridSize.w >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      case 'left':
        state.wl = head_y + gridSize.h >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.ws = head_x - gridSize.w < 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wr = head_y - gridSize.h < 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        break
      case 'right':
        state.wl = head_y - gridSize.h < 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        state.wr = head_y + gridSize.h >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.ws = head_x + gridSize.w >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      default:
        console.error('dir input not supported!', dir)
        break
    }
    for (let key in state) {
      if (state[key] == undefined) {
        throw "now what";
      }
    }
    return state;
  }

  getEncodedStr(st) {
    let keys = [ "ws","wl","wr","qfu","qfl","qtu","qtl"];
    let state = st || this.getState();
    let str = '';
    keys.forEach((key) => {
      // console.log(key);
      str = str + (state[key] ? '1' : '0');
    });
    return str;
  }

  getEncodedState(st) {
    let str = this.getEncodedStr(st);
    return parseInt(str, 2);
  }

  //returns an integer with max number of actions in any state
  getMaxNumActions() {
    return 3;
  }

  // takes an integer s and returns a list of available actions, which should be integers from zero to maxNumActions
  allowedActions(s) {
    let state = this.decodeState(s);
    let poss = [];
    if (state.ws == false) {
      poss.push(0);
    }
    if (state.wl == false) {
      poss.push(1);
    }
    if (state.wr == false) {
      poss.push(2);
    }
    return poss;
  }

  reset() {
    this.snake.time = 0
    this.snake.direction = 'down'
    this.snake.body = []
    this.snake.children = []
    this.snake.head = this.snake._createSquare(this.snake._headTexture)
    this.snake.head.position.set(worldSize.w / 2, worldSize.h / 2)
    this.snake.addChild(this.snake.head)
    this.snake.abstractMap = new AbstractMap()
    this.snake.abstractMap.setPosition(this.snake.head.position)
  }

  update(delta, a) {
    let reward = 0;
    try {
      reward = this.snake.update(delta, this.apple.position, a)
    } catch(err) {
      if (err == "fuck") {
        reward = getOutReward;
      } else {
        throw err;
      }
    }
    if (reward == eatSelfReward || reward == getOutReward) { // restart the game
      this.reset()
    } else if (this.snake.eatApple(this.apple.position)) {
      this.highest = Math.max(this.highest, this.snake.body.length)
      console.log("apple eaten!");
      const newPos = this.nextApplePosition()
      this.apple.moveTo(newPos)
    }
    return reward;
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }
}

export { Manager }
