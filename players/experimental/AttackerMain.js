const Vector = require('../../lib/Vector')
const TensorMath = require('../../lib/TensorMath')
const OrbitalIntention = require('../../Intention/OrbitalIntention')
const PointIntention = require('../../Intention/PointIntention')
const LookAtIntention = require('../../Intention/LookAtIntention')
const LineIntention = require('../../Intention/LineIntention')

const RulePlays = require('./RulePlays')

const BASE_SPEED = 50

let robot_saw_the_ball_multiplier = 0.5

module.exports = class AttackerMain extends RulePlays {
    setup(){
        super.setup()
        let ball = () => {

            return {
                x: this.frame.cleanData.ball.x,
                y: this.frame.cleanData.ball.y
            }
        }

        let ballShiftedP = () => {
            let ball = {
                x: this.frame.cleanData.ball.x - 60,
                y: this.frame.cleanData.ball.y + 150
            }
            return ball
        }

        let ballShiftedN = () => {
            let ball = {
                x: this.frame.cleanData.ball.x - 60,
                y: this.frame.cleanData.ball.y - 150
            }
            return ball
        }

        let ballToGoalNormal = () => {
            let b = this.frame.cleanData.ball
            let c = {x: 680, y: 0}

            let ballToGoal = Vector.sub(b, c)

            // Vector normal
            ballToGoal = Vector.norm({x: ballToGoal.x, y: -ballToGoal.y})

            return Vector.angle(ballToGoal)
        }

        this.orbitalRight = new OrbitalIntention('FollowBall', {
            target: ballShiftedN,
            clockwise: -1,
            radius: 75,
            decay: TensorMath.new.finish,
            multiplier: BASE_SPEED
        })

        this.addIntetion(this.orbitalRight)

        this.orbitalLeft = new OrbitalIntention('FollowBall', {
            target: ballShiftedP,
            clockwise: 1,
            radius: 75,
            decay: TensorMath.new.finish,
            multiplier: BASE_SPEED
        })

        this.addIntetion(this.orbitalLeft)

        /*
        Aproxima o robo da bola quando ele esta a 10 cm dela.
        O torna mais rapido e mais preciso na interceptação da mesma.
        Deve ser mais fraca que o movimento orbial para não cagar.
        */
        this.addIntetion(new PointIntention('KeepOnBall', {
            target: ball,
            radius: 110,
            radiusMax: 110,
            decay: TensorMath.new.finish,
            multiplier: BASE_SPEED
        }))

        this.addIntetion(new LineIntention('ConductBall', {
            target: ball,
            theta: ballToGoalNormal,
            lineSize: 75,
            lineSizeMax: 75,
            lineDist: 100,
            decay: TensorMath.new.finish,
            multiplier: BASE_SPEED * robot_saw_the_ball_multiplier
        }))

        // Impedir bater na parede
        this.avoidFieldWalls1 = new LineIntention('avoidFieldWalls', {
            target: {x:0, y: 610},
            theta: Vector.direction("left"),
            lineSize: 1700,
            lineDist: 30,
            lineDistMax: 30,
            decay: TensorMath.new.sum(1).mult(-1).finish,
            multiplier: BASE_SPEED * 2
        })

        this.addIntetion(this.avoidFieldWalls1)

        // Impedir bater na parede
        this.avoidFieldWalls2 = new LineIntention('avoidFieldWalls', {
            target: {x:0, y: -610},
            theta: Vector.direction("left"),
            lineSize: 1700,
            lineDist: 30,
            lineDistMax: 30,
            decay: TensorMath.new.sum(1).mult(-1).finish,
            multiplier: BASE_SPEED * 2
        })
        this.addIntetion(this.avoidFieldWalls2)

      }
      loop () {
        console.log(this.frame.cleanData.ball.y)
        let ball = {
            x: this.frame.cleanData.ball.x,
            y: this.frame.cleanData.ball.y
        }

        if (this.position.y > ball.y) {
            this.orbitalRight.weight = 0
            this.orbitalLeft.weight = 1
        } else {
            this.orbitalRight.weight = 1
            this.orbitalLeft.weight = 0
        }
      }
}