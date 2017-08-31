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

module.exports = verifyEventEmitter
