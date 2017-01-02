# BetterEvents - Improved version of the Node.js EventEmitter

## Installation

`npm i better-events`

## Class: BetterEvents

The BetterEvents constructor extends the default Node.js EventEmitter.

For more information on the EventEmitter see the Node.js docs:
https://nodejs.org/api/events.html

Here are the specs for the new methods of BetterEvents.

### emitter.once(eventName[, listener])

- __eventName__ \<String\> | \<Symbol\> name of the event
- __listener__ \<Function\> callback function

Like the original method (see: https://nodejs.org/api/events.html#events_emitter_once_eventname_listener) with exceptions.

If no callback is provided the method returns a \<Promise\> that resolves with the first argument of the event when the event is fired.

If one provides `true` instead of the callback the array mode gets activated.
The method returns a \<Promise\> which resolves with an array containing all the arguments of the event.
It gets resolved when the event is fired.

### emitter.collect(eventName, source)

- __eventName__ \<String\> | \<Symbol\> name of the event
- __source__ \<EventEmitter\> another EventEmitter

When the event specified by the __eventName__ gets fired at the __source__ it will also be emitted on this instance.

### emitter.collectOnce(eventName, source)

- __eventName__ \<String\> | \<Symbol\> name of the event
- __source__ \<EventEmitter\> another EventEmitter

Similar to _emitter.collect()_ but works only once.

### emitter.share(eventName, target)

- __eventName__ \<String\> | \<Symbol\> name of the event
- __target__ \<EventEmitter\> another EventEmitter

When the event specified by the __eventName__ gets fired at this instance it will also be emitted on the __target__.

### emitter.shareOnce(eventName, target)

- __eventName__ \<String\> | \<Symbol\> name of the event
- __target__ \<EventEmitter\> another EventEmitter

Similar to _emitter.share()_ but works only once.
