const _ = require('lodash')

module.exports = class RobotWorkers {
  constructor(match, robots) {
    this.match = match
    this.robots = robots
    this.workers = {}
  }

  toObject() {
    return _.mapValues(this.workers, worker => {
      return worker.toObject()
    })
  }

  async init() {
    // Make sure to initialize only once
    if (this.initialized)
      throw new Error('Cannot re-initialize RobotWorkers')
    this.initialized = true

    // Initialize robots
    for (let id in this.robots) {
      console.log('RobotWorkers', 'start', id)
      await this.start(id, this.robots[id])
    }

    // Bind: Everytime vision detects something, call update inside
    this.match.vision.on('detection', this.update.bind(this))
  }

  // Calls update on all robots
  async update(frame) {
    // Get team color
    let side = this.match.state.team
    let robots = frame['robots_' + side]

    // Iterare all workers
    let promises = _.values(this.workers).map(worker => {
      // Find specific robot state
      let detection = _.find(robots, {id: worker.visionId})

      // Delegate update method to robots
      return worker.update(detection, frame)
    })

    // Wait all promises to finish
    await Promise.all(promises)
  }

  async start(id, options) {
    if (this.workers[id]) {
      throw new Error('Cannot start process. Process  already running:' + id)
    }

    // Instantiate RobotWorker class
    let worker = new options.class(id, this.match, options)
    
    // Register worker inside
    this.workers[id] = worker
  }
}