const { EventEmitter } = require('events')

/**
   * Throw if value is not an EventEmitter.
   * @param {*} value - The value to verify.
   * @param {string} name  - The name of the variable.
   */
function verifyEventEmitter(value, name) {
  if (!(value && value instanceof EventEmitter)) {
    throw new TypeError(name + ' must be an instance of EventEmitter')
  }
}

/**
 * Class representing better EventEmitter.
 * @class
 * @extends EventEmitter
 */
class BetterEvents extends EventEmitter {
  /**
   * Return a value that gets resolved when the event is emitted by the source.
   * @param {BetterEvents|EventEmitter} source - The source of the event.
   * @param {string} eventName - The name of the event.
   * @param {boolean} [arrayMode] - Convert all arguments of the event into an array.
   * @returns {Promise.<*>}
   */
  static async once(source, eventName, arrayMode) {
    if (!(source instanceof EventEmitter)) {
      throw new TypeError('source must be an instance of EventEmitter')
    }

    if (source instanceof BetterEvents) {
      return source.once(eventName, !!arrayMode)
    }

    if (eventName === 'error') {
      return new Promise((resolve, reject) => {
        source.once('error', reject)
      })
    }

    if (arrayMode) {
      return new Promise(resolve => {
        source.once(eventName, (...args) => {
          resolve(args)
        })
      })
    }

    return new Promise((resolve) => {
      source.once(eventName, resolve)
    })
  }

  /**
   * Listen for an event once.
   * @param {string} eventName - The name of the event.
   * @param {true|function} [listener] - Function that listens for the event.
   * @returns {?Promise.<*>} - If no callback is provided, a promise gets returned.
   */
  once(eventName, listener) {
    if (typeof listener === 'function') {
      return super.once(eventName, listener)
    }

    if (eventName === 'error') {
      return new Promise((resolve, reject) => {
        super.once('error', reject)
      })
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

  /**
   * Collect an event from the source.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} source - The source of the Event.
   * @returns {callback} - The callback that has been applied to the source.
   */
  collect(eventName, source) {
    BetterEvents.verifyEventEmitter(source, 'source')

    const cb = this.emit.bind(this, eventName)

    source.on(eventName, cb)

    return cb
  }

  /**
   * Collect an event from the source once.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} source - The source of the Event.
   * @returns {callback} - The callback that has been applied to the source.
   */
  collectOnce(eventName, source) {
    BetterEvents.verifyEventEmitter(source, 'source')

    const cb = this.emit.bind(this, eventName)

    source.once(eventName, cb)

    return cb
  }

  /**
   * Share an event an event with the target.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} target - The target for the Event.
   * @returns {callback} - The callback that has been applied to the target.
   */
  share(eventName, target) {
    BetterEvents.verifyEventEmitter(target, 'target')

    const cb = target.emit.bind(target, eventName)

    this.on(eventName, cb)

    return cb
  }

  /**
   * Share an event an event with the target once.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} target - The target for the Event.
   * @returns {callback} - The callback that has been applied to the target.
   */
  shareOnce(eventName, target) {
    BetterEvents.verifyEventEmitter(target, 'target')

    const cb = target.emit.bind(target, eventName)

    this.once(eventName, cb)

    return cb
  }
}

BetterEvents.BetterEvents = BetterEvents
BetterEvents.verifyEventEmitter = verifyEventEmitter

module.exports = BetterEvents
