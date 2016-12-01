const EventEngine = require('events');

class BetterEvents extends EventEngine {
    constructor(...args) {
        super(...args);
    }

    once(eventName, listener) {
        if(listener) {
            return super.once(eventName, listener);
        }

        return new Promise(resolve => {
            super.once(eventName, resolve);
        });
    }

    collect(eventName, source) {
        if(!(source && source instanceof EventEngine)) {
            throw new TypeError('source must be an instance of EventEngine');
        }

        return source.on(eventName, this.emit.bind(this, eventName));
    }

    collectOnce(eventName, source) {
        if(!(source && source instanceof EventEngine)) {
            throw new TypeError('source must be an instance of EventEngine');
        }

        return source.once(eventName, this.emit.bind(this, eventName));
    }

    share(eventName, target) {
        if(!(target && target instanceof EventEngine)) {
            throw new TypeError('target must be an instance of EventEngine');
        }

        return this.on(eventName, target.emit.bind(target, eventName));
    }

    shareOnce(eventName, target) {
        if(!(target && target instanceof EventEngine)) {
            throw new TypeError('target must be an instance of EventEngine');
        }

        return this.once(eventName, target.emit.bind(target, eventName));
    }
}

module.exports = BetterEvents;
