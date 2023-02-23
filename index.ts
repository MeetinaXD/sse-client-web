/**
 * SSEClient Web
 *
 * Use Server Send Event by subscribe style
 *
 * @author      MeetinaXD
 * @version     1.0.0
 * @copyright   Copyright 2023 MeetinaXD
 * @license     MIT
 */

import mitt, { WildcardHandler } from 'mitt'
import { usePromise } from './utils/tools'

type Milliseconds = number
type ComingMessageHandler<T = unknown> = (message: T) => void
type ErrorHandler<T = unknown> = (url: T, message?: Event) => void
type SSEClientInterceptor<R, T = unknown> = (url: R, event: string, message: T) => T | Promise<T> | null

const sleep = (time: Milliseconds) => new Promise(resolve => {
  setTimeout(resolve, time)
})

export interface RetryConfig {
  /**
   * How many times should retry after `EventSource.onError` occurred.
   */
  retries?: number
  /**
   * Specifies the number of milliseconds between each retry, default is 1000
   */
  interval?: Milliseconds
}

export interface SSEClientConfig {
  /**
   * `baseURL` will be prepended to `url` in `subscribe` or `unsubscribe`
   */
  baseURL?: string
  retry?: RetryConfig
}

const defaultRetryConfig: Readonly<Required<RetryConfig>> = {
  retries: 3,
  interval: 1000,
}

Object.freeze(defaultRetryConfig)

export type SSEClientSubscriberType = Record<string, unknown>

export class SSEEventSubscriber<Events extends SSEClientSubscriberType> {
  private eventSubscribers: Map<keyof Events, ComingMessageHandler> = new Map()
  private waitPromise: Promise<unknown>
  private emitter = mitt<Events>()

  constructor(
    private readonly eventSource: EventSource,
    private readonly url?: string,
    private readonly interceptor?: SSEClientInterceptor<string>
  ) {
    const { promise, resolve } = usePromise()
    this.waitPromise = promise
    eventSource.onopen = resolve
    eventSource.addEventListener('message', this._onMessageComing('message'))
  }

  private _onMessageComing(name: string) {
    return async (event: MessageEvent) => {
      let { data } = event
      try {
        data = JSON.parse(data)
      } catch { }

      if (this.interceptor) {
        const ret = await this.interceptor(this.url, name, data)
        if (!ret) {
          return;
        }
        data = ret
      }
      this.emitter.emit(name, data)
    }
  }

  /**
   * register event
   * @param event event in `MessageEvent`, use `'*'` to receive all event, use `'message'` to receive unnamed event.
   */
  on(event: '*', onMessageComing: WildcardHandler<Events>): this
  on(event: 'message', onMessageComing: ComingMessageHandler): this
  on<EventName extends keyof Events>(
    event: EventName,
    onMessageComing: ComingMessageHandler<Events[EventName]>
  ): this

  on<EventName extends keyof Events>(
    event: EventName | '*' | 'message',
    onMessageComing: ComingMessageHandler<Events[EventName]> | ComingMessageHandler | WildcardHandler<Events>
  ): this {
    this.emitter.on(event, onMessageComing as any)
    const name = event as string

    if (
      /**
       * always ignore '*' and 'message' when adding / deleting listener
       */
      name !== '*'
      && name !== 'message'
      /**
       * Each event in EventSource can only be added once.
       * We use mitt to call all message handlers.
       */
      && !this.eventSubscribers.has(event)
    ) {
      const fn = this._onMessageComing(name)
      this.eventSubscribers.set(event, fn)
      this.eventSource.addEventListener(name, fn)
    }

    return this
  }

  /**
   * unregister event
   *
   * use `'*'` for all events
   */
  off(event: '*', onMessageComing: WildcardHandler<Events>): this
  off(event: 'message', onMessageComing?: ComingMessageHandler): this
  off<EventName extends keyof Events>(
    event: EventName,
    onMessageComing?: ComingMessageHandler<Events[EventName]>
  ): this

  off<EventName extends keyof Events>(
    event: EventName | '*' | 'message',
    onMessageComing: ComingMessageHandler<Events[EventName]> | ComingMessageHandler | WildcardHandler<Events>
  ) {
    const name = event as string
    this.emitter.off(event, onMessageComing as any)

    if (
      /**
       * always ignore '*' and 'message' when adding / deleting listener
       */
      name !== '*'
      && name !== 'message'
    ) {
      const fn = this.eventSubscribers.get(event)
      this.eventSource.removeEventListener(name, fn)
    }

    return this
  }

  /**
   * unregister all events
   *
   * The same as using `off('*')`
   */
  offAll() {
    this.emitter.off('*')
    this.eventSubscribers.forEach((fn, name) => {
      this.eventSource.removeEventListener(name as string, fn)
    })
    this.eventSubscribers.clear()
  }

  /**
   * waiting for event source connection established
   */
  waitUntilOpened() {
    return this.waitPromise
  }
}

export class SSEClient<Events extends Record<string, SSEClientSubscriberType>> {
  private retryConfig = defaultRetryConfig

  private baseURL: string

  private subscribers: Map<keyof Events, EventSource> = new Map()

  private eventSubscribers: WeakMap<EventSource, SSEEventSubscriber<any>> = new WeakMap()

  private errorHandler: ErrorHandler<keyof Events>

  private closeHandler: ErrorHandler<keyof Events>

  private retries: Map<keyof Events, number> = new Map()

  private interceptor: SSEClientInterceptor<string> = null

  constructor(config?: SSEClientConfig, interceptor?: SSEClientInterceptor<keyof Events>) {
    this.baseURL = config?.baseURL ?? ''
    this.interceptor = interceptor
    if (config?.retry) {
      this.retryConfig = {
        ...this.retryConfig,
        ...config.retry
      }
    }
  }

  private _onError<Url extends keyof Events>(
    url: Url
  ) {
    return async (event: Event) => {
      this.errorHandler?.(url, event)
      this.unsubscribe(url)

      if (!this.retries.has(url)) {
        this.retries.set(url, 0)
      }

      this.retries.set(url, this.retries.get(url) + 1)
      if (this.retryConfig.retries && this.retries.get(url) >= this.retryConfig.retries) {
        console.error(`[SSEClient] Too many retry, this url is no longer subscribed: ${this.baseURL}${url as string}`, event)
        this.unsubscribe(url)
        this.closeHandler?.(url, event)
        return;
      }

      await sleep(this.retryConfig.interval)
      this.subscribe(url)
    }
  }

  subscribe<Url extends keyof Events>(
    url: Url
  ): SSEEventSubscriber<Events[Url]> {
    let subscriber = this.subscribers.get(url)
    let eventSubscriber = this.eventSubscribers.get(subscriber)

    if (eventSubscriber) {
      return eventSubscriber
    }

    subscriber = new EventSource(`${this.baseURL}${url as string}`)
    eventSubscriber = new SSEEventSubscriber(subscriber, url as string, this.interceptor?.bind(this))
    this.subscribers.set(url, subscriber)
    this.eventSubscribers.set(subscriber, eventSubscriber)

    subscriber.onerror = this._onError(url as string)

    return eventSubscriber
  }

  /**
   * close the connection to server
   */
  unsubscribe<Url extends keyof Events>(url: Url) {
    const subscriber = this.subscribers.get(url)
    subscriber?.close()
    this.closeHandler?.(url)
    this.subscribers.delete(url)
    this.retries.delete(url)
    this.eventSubscribers.delete(subscriber)
  }

  onError(onErrorComing: ErrorHandler<keyof Events>) {
    this.errorHandler = onErrorComing
  }

  onClose(onClose: ErrorHandler<keyof Events>) {
    this.closeHandler = onClose
  }
}
