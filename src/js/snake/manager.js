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
   * qfl: whether food position is left
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

  decodeState(s) {
    var dec2bin = (dec) => {
        return (dec >>> 0).toString(2);
    };
    var str = dec2bin(s);
    return {
      ws: s[0] == 1,
      wl: s[1] == 1,
      wr: s[2] == 1,
      qfu: s[3] == 1,
      qfd: s[4] == 1,
      qtu: s[5] == 1,
      qtd: s[6] == 1
    };
  }

  getState() {
    let head_x = this.snake.head.position._x;
    let head_y = this.snake.head.position._y;
    let tail_x = this.snake.tail.position._x;
    let tail_y = this.snake.tail.position._y;
    let apple_x = this.apple.position._x;
    let apple_y = this.apple.position._y;
    let direction = this.snake.direction;
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
        state.ws = head_y <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        state.wl = head_x <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wr = head_x >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      case 'down':
        state.ws = head_y >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.wr = head_x <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wl = head_x >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      case 'left':
        state.wl = head_y >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.ws = head_x <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x - gridSize.w, y: head_y})
        state.wr = head_y <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        break
      case 'right':
        state.wl = head_y <= 0 ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y - gridSize.h})
        state.wr = head_y >= worldSize.h ? true : this.snake.abstractMap.checkPos({x: head_x, y: head_y + gridSize.h})
        state.ws = head_x >= worldSize.w ? true : this.snake.abstractMap.checkPos({x: head_x + gridSize.w, y: head_y})
        break
      default:
        console.error('dir input not supported!', dir)
        break
    }
    return state;
  }

  getEncodedState() {
    let state = this.getState();
    let str = '';
    for (let key in state) {
      str = str + (state[key] ? '1' : '0');
    }
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
    if (! state.ws) {
      poss.push(0);
    }
    if (! state.wl) {
      poss.push(1);
    }
    if (! state.wr) {
      poss.push(2);
    }
    return poss;
  }

  update(delta, a) {
    this.snake.update(delta, this.apple.position, a)
    // TODO: game end
    if (this.snake.eatApple(this.apple.position)) {
      const newPos = this.nextApplePosition()
      this.apple.moveTo(newPos)
      return 100000; // huge reward
    }
  }

  nextApplePosition() {
    return this.snake.randomEmptyPosition()
  }
}

export { Manager }
