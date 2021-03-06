const verifyEventEmitter = require('./verifyEventEmitter')

/**
 * Share an event from the source with the target.
 * @param {string} eventName - The name of the event.
 * @param {*} source - The EventEmitter that emits the event.
 * @param {*} target - The EventEmitter that should also emit the event.
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

module.exports = shareEvent
