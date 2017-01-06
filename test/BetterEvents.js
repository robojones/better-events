const EventEmitter = require('events')
const BetterEvents = require('./../BetterEvents')
const once = BetterEvents.once

const assert = require('assert')
const xTime = require('x-time')

describe('BetterEvents', function () {

    const ARGUMENTS = [1000, "hi", true]
    const EVENT = 'example'

    describe('BetterEvents.once(source, eventName[, arrayMode])', function () {

        it('should reject the promise if source is no instance of EventEmitter', function () {
            return once(null, EVENT).catch(() => {
                return true
            }).then(err => {
                assert(err, 'promise resolved')
            })
        })

        describe('source instance of EventEmitter', function () {

            beforeEach(function () {
                this.vanilla = new EventEmitter()
            })

            describe('arrayMode = false', function () {

                beforeEach(function () {
                    this.r = once(this.vanilla, EVENT)
                })

                it('should return a promise', function () {
                    assert(this.r instanceof Promise)
                })

                it('should resolve the promise with the first argument of the event', function () {
                    this.vanilla.emit(EVENT, ...ARGUMENTS)
                    return this.r.then((v) => {
                        assert.strictEqual(v, ARGUMENTS[0])
                    })
                })
            })

            describe('arrayMode = true', function () {

                beforeEach(function () {
                    this.r = once(this.vanilla, EVENT, true)
                })

                it('should return a promise if arrayMode is active', function () {
                    assert(this.r instanceof Promise)
                })

                it('should resolve the promise with the first argument of the event', function () {
                    this.vanilla.emit(EVENT, ...ARGUMENTS)
                    return this.r.then((v) => {
                        assert.deepEqual(v, ARGUMENTS)
                    })
                })
            })
        })

        describe('source instanceof BetterEvents', function () {

            beforeEach(function () {
                this.emitter = new BetterEvents()
            })

            it('should return a promise', function () {
                let r = once(this.emitter, EVENT)
                assert(r instanceof Promise)
            })
        })
    })

    describe('emitter#once(eventName[, callback])', function () {

        beforeEach(function () {
            this.emitter = new BetterEvents()
        })

        describe('callback instance of function', function () {

            it('should call the callback with the events arguments', function (cb) {
                this.emitter.once(EVENT, (...v) => {
                    assert.deepEqual(v, ARGUMENTS)
                    cb()
                })
                this.emitter.emit(EVENT, ...ARGUMENTS)
            })
        })

        describe('callback = false', function () {

            beforeEach(function () {
                this.r = this.emitter.once(EVENT, false)
            })

            it('should return a promise', function () {
                assert(this.r instanceof Promise)
            })

            it('should resolve the promise with the events first argument', function () {
                this.emitter.emit(EVENT, ...ARGUMENTS)
                return this.r.then(v => {
                    assert.strictEqual(v, ARGUMENTS[0])
                })
            })
        })

        describe('callback = true (array mode)', function () {

            beforeEach(function () {
                this.r = this.emitter.once(EVENT, true)
            })

            it('should return a promise', function () {
                assert(this.r instanceof Promise)
            })

            it('should resolve the promise with the events arguments', function () {
                this.emitter.emit(EVENT, ...ARGUMENTS)
                return this.r.then(v => {
                    assert.deepEqual(v, ARGUMENTS)
                })
            })
        })
    })

    beforeEach(function () {
        this.emitter = new BetterEvents()
        this.other = new BetterEvents()
    })

    describe('emitter#collect(eventName, source)', function () {

        it('should throw an error if source ist not an instance of EventEmitter', function () {
            try {
                this.emitter.collect(EVENT, null)
            } catch(err) {
                assert(err instanceof Error)
            }
        })

        beforeEach(function () {
            this.r = this.emitter.collect(EVENT, this.other)
            this.ev = this.emitter.once(EVENT, true)
        })

        it('should return a function', function () {
            assert.strictEqual(typeof this.r, 'function')
        })

        it('should collect the event', function () {
            this.other.emit(EVENT, ...ARGUMENTS)
            return this.ev.then(v => {
                assert.deepEqual(v, ARGUMENTS)
            })
        })
    })

    describe('emitter#collectOnce(eventName, source)', function () {

        it('should throw an error if source ist not an instance of EventEmitter', function () {
            try {
                this.emitter.collectOnce(EVENT, null)
            } catch(err) {
                assert(err instanceof Error)
            }
        })

        beforeEach(function () {
            this.r = this.emitter.collectOnce(EVENT, this.other)
            this.ev = this.emitter.once(EVENT, true)
        })

        it('should return a function', function () {
            assert.strictEqual(typeof this.r, 'function')
        })

        it('should collect the event', function () {
            this.other.emit(EVENT, ...ARGUMENTS)
            return this.ev.then(v => {
                assert.deepEqual(v, ARGUMENTS)
            })
        })
    })

    describe('emitter#share(eventName, target)', function () {

        it('should throw an error if target ist not an instance of EventEmitter', function () {
            try {
                this.emitter.share(EVENT, null)
            } catch(err) {
                assert(err instanceof Error)
            }
        })

        beforeEach(function () {
            this.r = this.emitter.share(EVENT, this.other)
            this.ev = this.other.once(EVENT, true)
        })

        it('should return a function', function () {
            assert.strictEqual(typeof this.r, 'function')
        })

        it('should collect the event', function () {
            this.emitter.emit(EVENT, ...ARGUMENTS)
            return this.ev.then(v => {
                assert.deepEqual(v, ARGUMENTS)
            })
        })
    })

    describe('emitter#shareOnce(eventName, target)', function () {

        it('should throw an error if target ist not an instance of EventEmitter', function () {
            try {
                this.emitter.shareOnce(EVENT, null)
            } catch(err) {
                assert(err instanceof Error)
            }
        })

        beforeEach(function () {
            this.r = this.emitter.shareOnce(EVENT, this.other)
            this.ev = this.other.once(EVENT, true)
        })

        it('should return a function', function () {
            assert.strictEqual(typeof this.r, 'function')
        })

        it('should collect the event', function () {
            this.emitter.emit(EVENT, ...ARGUMENTS)
            return this.ev.then(v => {
                assert.deepEqual(v, ARGUMENTS)
            })
        })
    })
})
