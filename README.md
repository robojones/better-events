# BetterEvents
An improved version of the Node.js EventEmitter.

[![Build Status](https://travis-ci.org/robojones/better-events.svg?branch=master)](https://travis-ci.org/robojones/better-events)
[![Test Coverage](https://codeclimate.com/github/robojones/better-events/badges/coverage.svg)](https://codeclimate.com/github/robojones/better-events/coverage)

[![bitHound Code](https://www.bithound.io/github/robojones/better-events/badges/code.svg)](https://www.bithound.io/github/robojones/better-events)
[![bitHound Overall Score](https://www.bithound.io/github/robojones/better-events/badges/score.svg)](https://www.bithound.io/github/robojones/better-events)
[![bitHound Dependencies](https://www.bithound.io/github/robojones/better-events/badges/dependencies.svg)](https://www.bithound.io/github/robojones/better-events/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/robojones/better-events/badges/devDependencies.svg)](https://www.bithound.io/github/robojones/better-events/master/dependencies/npm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```
npm i better-events --save
```

## Changes

- v3.0.0
  - The promises returned by the [BetterEvents.once](#bettereventsoncesource-eventname-arraymode) and [emitter.once](#emitteronceeventname-listener) methods now get cached. The same promise gets returned until the event gets emitted.
  - Add static [shareEvent](#bettereventsshareeventeventname-source-target-once) method.
- v2.0.0
  - Promises for the "error" event will now be rejected when an error is emitted.

## Class: BetterEvents

The BetterEvents constructor extends the default Node.js EventEmitter.

For more information on the EventEmitter see the Node.js docs:
https://nodejs.org/api/events.html

Here are the specs for the new methods of BetterEvents.

### BetterEvents.once(source, eventName[, arrayMode])

- __source__ `<EventEmitter>` The source for the Event.
- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __arrayMode__ `<Boolean>` resolve the promise with an array containing all arguments of the event

__Returns__ a `<Promise>` that gets resolved with the first argument of the event.
It gets resolved when the source emits the event.
If the eventName is "error" then the promise gets rejected as soon as an error is emitted.

```javascript
const { once } = require('better-events')

async function read() {
  const readstream = fs.createReadStream('example.txt')

  let text = ''
  readstream.on('data', chunk => {
    text += chunk
  })

  // Await the "close" event.
  await once(readstream, 'close')

  // Log the contents of the file.
  console.log('text:', text)
}

read()
```

### BetterEvents.shareEvent(eventName, source, target, once)

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __source__ `<EventEmitter>` the EventEmitter that emits the event.
- __target__ `<EventEmitter>` The EventEmitter to share the event with.
- __once__ `<Boolean>` Share the event only once.

__Returns__ the listener that has been applied to the source so one can use _.removeListener()_.

This method allows you to share events. If the event gets emitted on the _source_, it also gets emitted on the _target_. This works only __one way__. If the shared event gets emitted on the _target_, it is __not__ emitted on the _source_.

```javascript
const {
  BetterEvents,
  shareEvent
} = require('better-events')

const emitter1 = new BetterEvents()
const emitter2 = new BetterEvents()

shareEvent('hello', emitter1, emitter2)

emitter2.on('hello', () => console.log('received event'))

emitter1.emit('hello')
// "received event" will be logged.
```

### emitter.once(eventName[, listener])

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __listener__ `<Function>` | `<Boolean>` callback function

Like the original method (see: https://nodejs.org/api/events.html#events_emitter_once_eventname_listener) with exceptions.

If no callback is provided the method returns a `<Promise>` that resolves with the first argument of the event when the event is fired.
If the eventName is "error" then the promise gets rejected as soon as an error is emitted.

If one provides `true` instead of the callback the array mode gets activated.
The method returns a `<Promise>` which resolves with an array containing all the arguments of the event.
It gets resolved when the event is fired.

```javascript
const BetterEvents = require('better-events')

// Create your own class that extends BetterEvents.
class Seconds extends BetterEvents {
  constructor() {
    setInterval(() => {
      this.emit('second')
    }, 1000)
  }
}

// Create an instance of your class.
const example = new Seconds()

// Get a promise for the 'second' event.
example.once('second').then(() => {
  console.log('one second has passed')
})
```

### emitter.collect(eventName, source)

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __source__ `<EventEmitter>` The source for the Event.

__Returns__ the listener that has been applied to the source so one can use _.removeListener()_.

When the event specified by the __eventName__ gets fired at the __source__ it will also be emitted on this instance.

### emitter.collectOnce(eventName, source)

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __source__ `<EventEmitter>` The target for the Event.

__Returns__ the listener that has been applied to the source so one can use _.removeListener()_.

Similar to _emitter.collect()_ but works only once.

### emitter.share(eventName, target)

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __target__ `<EventEmitter>` The target for the Event.

__Returns__ the listener that has been applied to the source so one can use _.removeListener()_.

When the event specified by the __eventName__ gets fired at this instance it will also be emitted on the __target__.

### emitter.shareOnce(eventName, target)

- __eventName__ `<String>` | `<Symbol>` The name of the event.
- __target__ `<EventEmitter>` The target for the Event.

__Returns__ the listener that has been applied to the source so one can use _.removeListener()_.

Similar to _emitter.share()_ but works only once.
