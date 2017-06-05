import _ from 'lodash'
import { RL } from './rl'
import {
  opposite, DIRECTIONS
} from '../snake/utils'
import { Rewards } from './config'

class RlEnv {
  constructor(snake, apple) {
    this.snake = snake
    this.apple = apple
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
    return 128
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
    }
    // get the relative position of the head and the tail
    state.qfu = apple_y <= head_y
    state.qfl = apple_x <= head_x
    state.qtu = tail_y <= head_y
    state.qtl = tail_x <= head_x

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
        throw "now what"
      }
    }
    return state
  }

  getEncodedStr(st) {
    let keys = [ "ws","wl","wr","qfu","qfl","qtu","qtl"];
    let state = st || this.getState();
    let str = '';
    keys.forEach((key) => {
      // console.log(key);
      str = str + (state[key] ? '1' : '0')
    })
    return str
  }

  getEncodedState(st) {
    let str = this.getEncodedStr(st)
    return parseInt(str, 2)
  }

  //returns an integer with max number of actions in any state
  getMaxNumActions() {
    return 3
  }

  // takes an integer s and returns a list of available actions, which should be integers from zero to maxNumActions
  allowedActions(s) {
    let state = this.decodeState(s)
    let poss = [];
    if (state.ws == false) {
      poss.push(0)
    }
    if (state.wl == false) {
      poss.push(1)
    }
    if (state.wr == false) {
      poss.push(2)
    }
    return poss
  }
}

class QLearner {
  constructor(snake, apple) {
    this.snake = snake
    this.apple = apple
    const spec = {}
    spec.update = 'qlearn'; // 'qlearn' or 'sarsa'
    spec.gamma = 0.6; // discount factor, [0, 1)
    spec.epsilon = 0; // initial epsilon for epsilon-greedy policy, [0, 1)
    spec.alpha = 0.15; // value function learning rate
    spec.lambda = 0; // eligibility trace decay, [0,1). 0 = no eligibility traces
    spec.replacing_traces = true; // use replacing or accumulating traces
    spec.planN = 50; // number of planning steps per iteration. 0 = no planning
    spec.smooth_policy_update = true; // non-standard, updates policy smoothly to follow max_a Q
    spec.beta = 0.1; // learning rate for smooth policy update
    this.spec = spec
    this.rlEnv = new RlEnv(snake, apple)
    this.agent = new RL.TDAgent(this.rlEnv, spec)
  }

  selectDirection() {
    let act = this.agent.act(this.rlEnv.getEncodedState())
    if (act !== undefined) {
      switch(this.snake.direction) {
        case 'up':
          if (act === 0) return 'up'
          if (act === 1) return 'left'
          if (act === 2) return 'right'
          break
        case 'down':
          if (act === 0) return 'down'
          if (act === 1) return 'right'
          if (act === 2) return 'left'
          break
        case 'left':
          if (act === 0) return 'left'
          if (act === 1) return 'down'
          if (act === 2) return 'up'
          break
        case 'right':
          if (act === 0) return 'right'
          if (act === 1) return 'up'
          if (act === 2) return 'down'
          break
        default:
          break
      }
      console.error('action input not supported', act)
    }
    // else just random the direction
    const currDir = this.snake.direction
    let dirs = DIRECTIONS.slice()
    _.pull(dirs, opposite(currDir))
    const randDir = _.sample(dirs)
    this.currQValue = this.getQValue(randDir)
    return randDir
  }

  updateQ(state) {
    const reward = Rewards[state]
    this.agent.learn(reward)
  }

}

export { QLearner }
