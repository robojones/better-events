const { EventEmitter } = require('events')

/**
   * Throws an error if the value is not an EventEmitter.
   * @param {*} value - The value to verify.
   * @param {string} name  - The name of the variable.
   */
function verifyEventEmitter(value, name) {
  if (!(value && value instanceof EventEmitter)) {
    throw new TypeError(name + ' must be an instance of EventEmitter')
  }
}

/**
 * Share an event from the source with the target.
 * @param {string} eventName - The name of the event.
 * @param {EventEmitter} source - The EventEmitter that emits the event.
 * @param {EventEmitter} target - The EventEmitter that should also emit the event.
 * @param {boolean} [once] - Share the event only once.
 * @returns {function} - The callback that has been applied to the target.
 */
function shareEvent(eventName, source, target, once = false) {
  verifyEventEmitter(source, 'source')
  verifyEventEmitter(target, 'target')

  const cb = target.emit.bind(target, eventName)

  source[once ? 'once' : 'on'](eventName, cb)

  return cb
}

/**
 * Class representing better EventEmitter.
 * @class
 * @extends EventEmitter
 */
class BetterEvents extends EventEmitter {
  /**
   * Return a promise that gets resolved when the event is emitted by the source.
   * @param {BetterEvents|EventEmitter} source - The source of the event.
   * @param {string} eventName - The name of the event.
   * @param {boolean} [arrayMode] - Convert all arguments of the event into an array.
   * @returns {Promise.<*>}
   */
  static async once(source, eventName, arrayMode) {
    if (!(source instanceof EventEmitter)) {
      throw new TypeError('source must be an instance of EventEmitter')
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
   * @param {true|function} [listener] - Function that listens for the event. If set to true, the array-mode will be used and a promise will be returned.
   * @returns {BetterEvents|Promise.<*>} - If no callback is provided, a promise gets returned.
   */
  once(eventName, listener) {
    if (typeof listener === 'function') {
      return super.once(eventName, listener)
    }

    return BetterEvents.once(this, eventName, listener)
  }

  /**
   * Collect an event from the source.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} source - The source of the Event.
   * @returns {callback} - The callback that has been applied to the source.
   */
  collect(eventName, source) {
    return shareEvent(eventName, source, this)
  }

  /**
   * Collect an event from the source once.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} source - The source of the Event.
   * @returns {callback} - The callback that has been applied to the source.
   */
  collectOnce(eventName, source) {
    return shareEvent(eventName, source, this, true)
  }

  /**
   * Share an event an event with the target.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} target - The target for the Event.
   * @returns {callback} - The callback that has been applied to the target.
   */
  share(eventName, target) {
    return shareEvent(eventName, this, target)
  }

  /**
   * Share an event an event with the target once.
   * @param {string} eventName - The name of the event.
   * @param {BetterEvents|EventEmitter} target - The target for the Event.
   * @returns {callback} - The callback that has been applied to the target.
   */
  shareOnce(eventName, target) {
    return shareEvent(eventName, this, target, true)
  }
}

BetterEvents.BetterEvents = BetterEvents
BetterEvents.verifyEventEmitter = verifyEventEmitter
BetterEvents.shareEvent = shareEvent

module.exports = BetterEvents
