const EventEmitter = require('events')

class BetterEvents extends EventEmitter {
  static verifyEventEmitter(value, name) {
    if (!(value && value instanceof EventEmitter)) {
      throw new TypeError(name + ' must be an instance of EventEmitter')
    }
  }

  static once(source, eventName, arrayMode) {
    if (!(source instanceof EventEmitter)) {
      return Promise.reject(new TypeError('source must be an instance of EventEmitter'))
    }

    if (source instanceof BetterEvents) {
      return source.once(eventName, !!arrayMode)
    }

    if (arrayMode) {
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
    if (typeof listener === 'function') {
      return super.once(eventName, listener)
    }

    if (listener === true) {
      // promise mode with array

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
    BetterEvents.verifyEventEmitter(source, 'source')

    const cb = this.emit.bind(this, eventName)

    source.on(eventName, cb)

    return cb
  }

  collectOnce(eventName, source) {
    BetterEvents.verifyEventEmitter(source, 'source')

    const cb = this.emit.bind(this, eventName)

    source.once(eventName, cb)

    return cb
  }

  share(eventName, target) {
    BetterEvents.verifyEventEmitter(target, 'target')

    const cb = target.emit.bind(target, eventName)

    this.on(eventName, cb)

    return cb
  }

  shareOnce(eventName, target) {
    BetterEvents.verifyEventEmitter(target, 'target')

    const cb = target.emit.bind(target, eventName)

    this.once(eventName, cb)

    return cb
  }
}

BetterEvents.BetterEvents = BetterEvents

module.exports = BetterEvents
