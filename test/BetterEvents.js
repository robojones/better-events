const BetterEvents = require('./../BetterEvents')

const assert = require('assert')
const xTime = require('x-time')

describe('BetterEvents', function () {

    beforeEach(function () {
        this.emitter = new BetterEvents()
        this.other = new BetterEvents()
    })

    describe('BetterEvents#once(eventName)', function () {

        it('should return a promise', function () {

            let r = this.emitter.once('example')
            assert(r instanceof Promise)

        })

        describe('return: promise', function () {

            it('should resolve with the first argument of the event', function () {

                let r = this.emitter.once('example')

                this.emitter.emit('example', 1, 2)

                return r.then(v => {
                    assert.strictEqual(v, 1)
                })
            })
        })
    })

    describe('BetterEvents#once(eventName, true)', function () {

        it('should return a promise', function () {

            let r = this.emitter.once('example', true)
            assert(r instanceof Promise)
        })

        describe('return: promise', function () {
            it('should resolve with an array containing all the events arguments', function () {

                let r = this.emitter.once('example', true)

                let arg = [1, 2, 3]

                this.emitter.emit('example', ...arg)

                return r.then(v => {
                    assert.deepEqual(v, arg)
                })
            })
        })
    })

    describe('BetterEvents#once(eventName, callback)', function () {

        it('should return itself', function () {

            let r = this.emitter.once('example', function () {})

            assert.strictEqual(r, this.emitter)
        })

        it('should run the callback with the given arguments', function (cb) {

            let arg = [1, 2, 3]

            let r = this.emitter.once('example', (...v) => {

                try {
                    assert.deepEqual(v, arg)
                } catch(err) {
                    cb(err)
                    return
                }

                cb()
            })

            this.emitter.emit('example', ...arg)
        })
    })

    describe('BetterEvents#collect(eventName, source)', function () {

        it('should return a function', function () {

            let r = this.emitter.collect('example', this.other)

            assert.strictEqual(typeof r, 'function')
        })

        it('should emit the same event as the source', function (cb) {

            this.emitter.collect('example', this.other)

            let arg = [1, 2, 3]

            let count = 5

            this.emitter.on('example', (...v) => {

                try {
                    assert.deepEqual(v, arg)
                } catch(err) {
                    cb(err)
                    return
                }

                if(count--) {
                    this.other.emit('example', ...arg)

                    return
                }

                cb()
            })

            this.other.emit('example', ...arg)
        })
    })

    describe('BetterEvents#collectOnce(eventName, source)', function () {

        it('should return a function', function () {

            let r = this.emitter.collect('example', this.other)

            assert.strictEqual(typeof r, 'function')
        })

        it('should emit the same event as the source - but only once', function () {

            this.emitter.collectOnce('example', this.other)

            let arg = [1, 2, 3]

            let count = 5

            let r = this.emitter.once('example', true).then(v => {

                let q = []

                assert.deepEqual(v, arg)

                q.push(xTime(10, true))

                q.push(this.emitter.once('example').then(() => {
                    //this should not happen
                    console.log('this should never happen')
                    return false
                }))

                this.other.emit('example', ...arg)

                return Promise.race(q)
            })

            this.other.emit('example', ...arg)

            return r.then(success => {
                if(!success) {
                    return Promise.reject(new Error('handler runs twice'))
                }
            })
        })
    })

    describe('BetterEvents#share(eventName, target)', function () {

        it('should return a function', function () {

            let r = this.emitter.collect('example', this.other)

            assert.strictEqual(typeof r, 'function')
        })

        it('target emit the same event to the target', function (cb) {

            this.other.share('example', this.emitter)

            let arg = [1, 2, 3]

            let count = 5

            this.emitter.on('example', (...v) => {

                try {
                    assert.deepEqual(v, arg)
                } catch(err) {
                    cb(err)
                    return
                }

                if(count--) {
                    this.other.emit('example', ...arg)

                    return
                }

                cb()
            })

            this.other.emit('example', ...arg)
        })
    })

    describe('BetterEvents#shareOnce(eventName, target)', function () {

        it('should return a function', function () {

            let r = this.other.shareOnce('example', this.emitter)

            assert.strictEqual(typeof r, 'function')
        })

        it('should emit the same event to the target - but only once', function () {

            this.other.shareOnce('example', this.emitter)

            let arg = [1, 2, 3]

            let count = 5

            let r = this.emitter.once('example', true).then(v => {

                let q = []

                assert.deepEqual(v, arg)

                q.push(xTime(10, true))

                q.push(this.emitter.once('example').then(() => {
                    //this should not happen
                    console.log('this should never happen')
                    return false
                }))

                this.other.emit('example', ...arg)

                return Promise.race(q)
            })

            this.other.emit('example', ...arg)

            return r.then(success => {
                if(!success) {
                    return Promise.reject(new Error('handler runs twice'))
                }
            })
        })
    })
})
