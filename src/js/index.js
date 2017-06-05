import * as PIXI from 'pixi.js'
import { Snake, Apple, Manager, CONFIG } from './snake'
import {RL} from './rl'

const {
  worldSize, gridSize, backgroundColor
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
  spec.gamma = 0.9; // discount factor, [0, 1)
  spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
  spec.alpha = 0.1; // value function learning rate
  spec.lambda = 0; // eligibility trace decay, [0,1). 0 = no eligibility traces
  spec.replacing_traces = true; // use replacing or accumulating traces
  spec.planN = 50; // number of planning steps per iteration. 0 = no planning
  spec.smooth_policy_update = true; // non-standard, updates policy smoothly to follow max_a Q
  spec.beta = 0.1; // learning rate for smooth policy update

  var agent = new RL.TDAgent(manager, spec);

  app.ticker.add((delta) => {
    // var a = agent.act(manager.getEncodedState());
    // var reward = manager.update(delta, a);
    // console.log(manager.getEncodedState());
    manager.update(delta);
    // agent.learn(reward);
  })
}
