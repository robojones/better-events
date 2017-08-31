const {
  once,
  shareEvent,
  BetterEvents
} = require('better-events')

const emitter1 = new BetterEvents()
const emitter2 = new BetterEvents()

async function example() {
  // If emitter1 emits "go" it will also be emitted by emitter2.
  shareEvent(emitter1, 'go', emitter2)

  // Await the "go" event.
  await once(emitter2, 'go')

  console.log("received event 'go'")
}

example().catch(console.error)

emitter1.emit('go')
