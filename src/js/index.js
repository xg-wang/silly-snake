import * as PIXI from 'pixi.js'
import { Snake, Apple, CONFIG } from './snake'
import { Manager } from './snake/manager'
import {RL} from './rl'

const {
  worldSize, gridSize, backgroundColor, eatSelfReward
} = CONFIG

const app = new PIXI.Application(
  worldSize.w, worldSize.h,
  {backgroundColor: backgroundColor}
)
document.body.appendChild(app.view)

PIXI.loader
  .add('../assets/snakeset.png')
  .load(setup)


function setup() {
  console.log('setup')
  const snake = new Snake(app.renderer)
  const apple = new Apple()
  const manager = new Manager(app, snake, apple)
  window.snake = snake;
  window.apple = apple;
  window.manager = manager;

  var spec = {}
  spec.update = 'qlearn'; // 'qlearn' or 'sarsa'
  spec.gamma = 0.6; // discount factor, [0, 1)
  spec.epsilon = 0; // initial epsilon for epsilon-greedy policy, [0, 1)
  spec.alpha = 0.15; // value function learning rate
  spec.lambda = 0; // eligibility trace decay, [0,1). 0 = no eligibility traces
  spec.replacing_traces = true; // use replacing or accumulating traces
  spec.planN = 50; // number of planning steps per iteration. 0 = no planning
  spec.smooth_policy_update = true; // non-standard, updates policy smoothly to follow max_a Q
  spec.beta = 0.1; // learning rate for smooth policy update

  var agent = new RL.TDAgent(manager, spec);
  var a;
  var reward;

  app.ticker.add((delta) => {
    try {
      a = agent.act(manager.getEncodedState());
      // console.log(`x: ${snake.head.position._x}, y: ${snake.head.position._y}`);
      // console.log('action:', a);
      console.log('current length: ', manager.snake.body.length);
      reward = manager.update(delta, a);
    }catch(err) {
      if (err.message == "wtf") {
        manager.reset();
        reward = eatSelfReward;
      }
    }

    // console.log(manager.getEncodedState());
    if (reward != undefined) {
      console.log('reward: ', reward);
      agent.learn(reward);
    }
  })
}
