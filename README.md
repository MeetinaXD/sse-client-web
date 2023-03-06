# sse-client-web

> A easier way to use [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) in subscribe style in Web / Node.js.


## Why?

Compared to normal HTTP request, there are fewer libraries available for SSE (Server Sent Events).

As an `axios` user, I'm looking for a way to use SSE as I did with axios.

This package makes your work slightly easier.


## Installation

```bash
npm install sse-client-web -S
```

Then with a module bundler like rollup or webpack, use as you would anything else:

```js
// using ES6 modules
import { SSEClient } from 'sse-client-web'

// using CommonJS modules
var { SSEClient } = require('sse-client-web')
```

The UMD build is also available on unpkg:

```html
<script src="https://unpkg.com/sse-client-web@1.4.0/lib/index.browser.js"></script>
```

You can find the library on `window.SSEClient`.


## Usage

```js
import { SSEClient } from 'sse-client-web'

// subscribe from URL
const client = new SSEClient({
  baseURL: '/sse'
})

client.onError((url, event) => {
  console.log(url, event)
})

const subscriber = client.subscribe('/real-time-events')
  .on('event1', data => {
    /** your codes here */
  })
  .on('event2', data => {
    /** your codes here */
  })
  .on('*', data => {
    /** your codes here */
  })

// ...

// unsubscribe events
subscriber.off('event1')
subscriber.off('event2')
// or unsubscribe all events
subscriber.offAll()

```


### Typescript

Use Typescript to import type inference for `SSEClient` instance method.

```ts
import { SSEClient } from 'sse-client-web'

type MySSEClient = {
  '/real-time-events': {
    foo: string
    bar: number
  }
}

// subscribe from URL
const client = new SSEClient<MySSEClient>({
  baseURL: '/sse'
})

client.onError((url, event) => {
  console.log(url, event)
})

client.subscribe('/it-doesnt-exist') // Error: Argument of type 'it-doesnt-exist' is not assignable to parameter of type 'foo' | 'bar'

const subscriber = client.subscribe('/real-time-events')
  .on('foo', data => {
    /** your codes here */
  })
  .on('bar', data => {
    /** your codes here */
  })
  .on('fox', data => { }) // Error: Property 'fox' does not exist on type

// ...

```

## API

### `SSEClient{}`

A class to create `SSEClient` instance.

- Type

```ts
export declare class SSEClient<Events extends Record<string, SSEClientSubscriberType>> {
    constructor(config?: SSEClientConfig, interceptor?: SSEClientInterceptor<keyof Events>);
    subscribe<Url extends keyof Events = ''>(url: Url): SSEEventSubscriber<Events[Url]>;
    unsubscribe<Url extends keyof Events>(url: Url): void;
    onError(onErrorComing: ErrorHandler<keyof Events>): void;
}
```

- Example

```ts
// subscribe from URL
const client = new SSEClient({
  baseURL: '/sse',
  retry: {
    // ms, default is 1000
    interval: 2000,
    // default is 3
    retries: 5
  }
})
```


### `SSEClient.subscribe()`

- Type

```ts
// Events[Url] === SSEClientSubscriberType
subscribe<Url extends keyof Events>(
  url: Url
): SSEEventSubscriber<Events[Url]>
```

- Example

```ts
const subscriber = new SSEClient()
  .subscribe('/real-time-events')
```


### `SSEClient.unsubscribe()`

- Type

```ts
unsubscribe<Url extends keyof Events>(
  url: Url
): void
```

- Example

```ts
const client = new SSEClient()
client.subscribe('/real-time-events')
// ...
client.unsubscribe('/real-time-events')
```


### `SSEEventSubscriber{}`

A class to create `SSEEventSubscriber` instance, which manages event listening.

- Type

```ts
export declare class SSEEventSubscriber<Events extends SSEClientSubscriberType> {
    constructor(event: EventSource, url?: string, interceptor?: SSEClientInterceptor<string>);
    /**
     * register event
     * @param event event in `MessageEvent`, use `'*'` to receive unnamed event.
     * @param onMessageComing
     */
    on<EventName extends keyof Events>(event: EventName | '*', onMessageComing: ComingMessageHandler<Events[EventName]>): this;
    /**
     * unregister event
     */
    off<EventName extends keyof Events>(event: EventName): this;
    /**
     * unregister all events
     */
    offAll(): void;
    /**
     * re-register all binding events
     */
    reRegister(): void;
    /**
     * waiting for event source connection established
     */
    waitUntilOpened(): Promise<unknown>;
}
```

### `SSEEventSubscriber.on()`

Listen a specified type of event.

- Type

```ts
on<EventName extends keyof Events>(
  event: EventName | '*',
  onMessageComing: ComingMessageHandler<Events[EventName]>
): this;
```

- Example

```ts
const subscriber = new SSEClient()
  .subscribe('/real-time-events')
    .on('foo', data => {
      // ...
    })
```


### `SSEEventSubscriber.off()`

Cancel listening a specified type of event.

- Type

```ts
off<EventName extends keyof Events>(
  event: EventName
): this;
```

- Example

```ts
const subscriber = new SSEClient()
  .subscribe('/real-time-events')
    .off('foo')
```


### `SSEEventSubscriber.offAll()`

Cancel listening ALL types of event.

- Type

```ts
offAll(): void
```


### `SSEEventSubscriber.waitUntilOpened()`

Waiting for event source connection established

- Type

```ts
waitUntilOpened(): Promise<unknown>
```

- Example

```ts
const subscriber = new SSEClient()
  .subscribe('/real-time-events')

await subscriber.waitUntilOpened()
console.log('connection established.')
```

## License

[MIT License](https://opensource.org/licenses/MIT) © 2023 [MeetinaXD](https://github.com/MeetinaXD)
