const EventEmitter = require('events')

class BetterEvents extends EventEmitter {
    static once(source, eventName, arrayMode) {

        if(!(source instanceof EventEmitter)) {
            return Promise.reject(new TypeError('source must be an instance of EventEmitter'))
        }

        if(source instanceof BetterEvents) {
            return source.once(eventName, !!arrayMode)
        }

        if(arrayMode) {
            return new Promise(resolve => {
                source.once(eventName, (...args) => {
                    resolve(args)
                })
            })
        } else {
            return new Promise(resolve => {
                source.once(eventName, resolve)
            })
        }
    }

    once(eventName, listener) {
        if(typeof listener === 'function') {
            return super.once(eventName, listener)
        }

        if (listener === true) {
            //promise mode with array

            return new Promise(resolve => {
                super.once(eventName, (...args) => {
                    resolve(args)
                })
            })
        }

        return new Promise(resolve => {
            super.once(eventName, resolve)
        })
    }

    collect(eventName, source) {
        if(!(source && source instanceof EventEmitter)) {
            throw new TypeError('source must be an instance of EventEmitter')
        }

        const cb = this.emit.bind(this, eventName)

        source.on(eventName, cb)

        return cb
    }

    collectOnce(eventName, source) {
        if(!(source && source instanceof EventEmitter)) {
            throw new TypeError('source must be an instance of EventEmitter')
        }

        const cb = this.emit.bind(this, eventName)

        source.once(eventName, cb)

        return cb
    }

    share(eventName, target) {
        if(!(target && target instanceof EventEmitter)) {
            throw new TypeError('target must be an instance of EventEmitter')
        }

        const cb = target.emit.bind(target, eventName)

        this.on(eventName, cb)

        return cb
    }

    shareOnce(eventName, target) {
        if(!(target && target instanceof EventEmitter)) {
            throw new TypeError('target must be an instance of EventEmitter')
        }

        const cb = target.emit.bind(target, eventName)

        this.once(eventName, cb)

        return cb
    }
}

module.exports = BetterEvents
