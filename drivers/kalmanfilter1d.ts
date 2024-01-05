namespace robot.drivers {
    /**
     * Kalman Filter 1D.
     * Ported from https://github.com/wouterbulten/kalmanjs
     */
    export class KalmanFilter1D {
        /**
         * Last filtered measurement
         */
        x: number = undefined
        /**
         * Measurement vector
         */
        C: number = 1
        private cov: number = undefined
        /**
         * Control vector
         */
        B: number = 0
        /**
         * Measurement noise
         */
        Q: number = 0.1
        /**
         * Process noise
         */
        R: number = 0.01
        /**
         * State vector
         */
        A: number = 1

        constructor() {}

        /**
         * Filter a new value
         * @param  {Number} z measurement
         * @param  {Number} u control
         * @return {Number}
         */
        filter(z: number/*, u: number*/) {
            const A = this.A
            const C = this.C
            const Q = this.Q
            if (isNaN(this.x)) {
                this.x = (1 / C) * z
                this.cov = (1 / C) * Q * (1 / C)
            } else {
                // Compute prediction
                const predX = A * this.x /*+ this.B * u*/
                const predCov = A * this.cov * A + this.R

                // Kalman gain
                const K = predCov * C * (1 / (C * predCov * C + Q))

                // Correction
                this.x = predX + K * (z - C * predX)
                this.cov = predCov - K * C * predCov
            }

            return this.x
        }
    }
}
