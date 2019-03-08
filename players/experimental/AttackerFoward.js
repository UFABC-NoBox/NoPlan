const IntentionPlayer = require('../IntentionPlayer')
const TensorMath = require('../../lib/TensorMath')
const Intention = require('../../Intention')
const LineIntention = require('../../Intention/LineIntention')
const PointIntention = require('../../Intention/PointIntention')
const LookAtIntention = require('../../Intention/LookAtIntention')
const OrbitalIntention = require('../../Intention/OrbitalIntention')
const Vector = require('../../lib/Vector')
const RulePlays = require('./RulePlays')

const BASE_SPEED = 65

module.exports = class AttackerForward extends RulePlays {
    setup () {
        super.setup()
        let ball = () => {
            let ball = {x: this.match.dataManager.ball.x, y: this.match.dataManager.ball.y}
            return ball
        }

        let ballSpeedBasedMultiplier = () => {
            let ballSpeed = Vector.size(this.match.dataManager.ball.speed)
            let multiplier = Math.max(Math.min(ballSpeed + 35, 80), 60)
            return multiplier
        }

        this.$lookAtBall = new Intention()
        this.$Attack = new Intention()
        this.$followBall = new Intention()

        this.addIntetion(this.$lookAtBall)
        this.addIntetion(this.$Attack)

        this.$Attack.addIntetion(new PointIntention('goGoal', {
            target: {x:700, y:0},
            radius: 150,
            decay: TensorMath.new.constant(1).deadWidth(0.15).finish,
            multiplier: ballSpeedBasedMultiplier
        }))

        this.$followBall.addIntetion(new PointIntention('goBall', {
            target: ball,
            radius: 150,
            decay: TensorMath.new.constant(1).deadWidth(0.15).finish,
            multiplier: ballSpeedBasedMultiplier
        }))

        this.$lookAtBall.addIntetion(new LookAtIntention('lookAtBall', {
            target: ball,
            decay: TensorMath.new.constant(1).deadWidth(0.15).finish,
            multiplier: 100,
        }))

      }
      loop(){
          let ball = {x: this.match.dataManager.ball.x, y: this.match.dataManager.ball.y}
          let robotDir = Vector.fromTheta(this.orientation)
          let robotToBall = Vector.sub(this.position, ball)
          let angle = Vector.toDegrees(Vector.angleBetween(robotDir, robotToBall))

          if (Math.abs(angle) > 20 && Math.abs(angle) < 160) {
            this.$lookAtBall.weight = 1
            this.$Attack.weight = 0
          } else {
            this.$lookAtBall.weight = 0
            this.$Attack.weight = 1
            this.$followBall = 0.5
          }
      }
}
