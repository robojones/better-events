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
 * Cache eventPromises
 * @param {Object} cache - The cache object.
 * @param {string} eventName - The name of the event.
 * @param {function} fn - The inner function for the promise.
 */
function eventPromiseCache(source, cacheProp, eventName, fn) {
  if (!source[cacheProp]) {
    source[cacheProp] = {}
  }

  const cache = source[cacheProp]
  if (!cache[eventName]) {
    console.log('creating new promise')
    cache[eventName] = new Promise((resolve, reject) => {
      function deleteAnd(fn) {
        // delete wrapper
        return result => {
          console.log(`deleting promise ${eventName} from cache ${cacheProp}`)
          delete cache[eventName]
          fn(result)
        }
      }

      fn(deleteAnd(resolve), deleteAnd(reject))
    })
  }

  return cache[eventName]
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
  static once(source, eventName, arrayMode) {
    if (!(source instanceof EventEmitter)) {
      return Promise.reject(new TypeError('source must be an instance of EventEmitter'))
    }

    if (arrayMode && eventName !== 'error') {
      const cacheProp = '_arrayEventPromises'
      const fn = resolve => {
        source.once(eventName, (...args) => resolve(args))
      }

      return eventPromiseCache(source, cacheProp, eventName, fn)
    }

    const cacheProp = '_eventPromises'
    const fn = (resolve, reject) => {
      if (eventName === 'error') {
        source.once('error', reject)
      }
      source.once(eventName, resolve)
    }

    return eventPromiseCache(source, cacheProp, eventName, fn)
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
