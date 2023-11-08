namespace robot {
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
        filter(z: number, u = 0) {
            if (isNaN(this.x)) {
                this.x = (1 / this.C) * z
                this.cov = (1 / this.C) * this.Q * (1 / this.C)
            } else {
                // Compute prediction
                const predX = this.A * this.x + this.B * u
                const predCov = this.A * this.cov * this.A + this.R

                // Kalman gain
                const K =
                    predCov *
                    this.C *
                    (1 / (this.C * predCov * this.C + this.Q))

                // Correction
                this.x = predX + K * (z - this.C * predX)
                this.cov = predCov - K * this.C * predCov
            }

            return this.x
        }
    }
}
