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

import { forIn, usePromise } from './utils/tools'

type Milliseconds = number
type ComingMessageHandler<T = unknown> = (message: T) => void
type ErrorHandler<T = unknown> = (url: T, message: Event) => void
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
  interval: 1000
}

Object.freeze(defaultRetryConfig)

export type SSEClientSubscriberType = Record<string, unknown>

export class SSEEventSubscriber<Events extends SSEClientSubscriberType> {
  private eventSubscribers: Record<string, ComingMessageHandler> = {}
  private waitPromise: Promise<unknown>

  constructor(
    private readonly event: EventSource,
    private readonly url?: string,
    private readonly interceptor?: SSEClientInterceptor<string>
  ) {
    const { promise, resolve } = usePromise()
    this.waitPromise = promise
    event.onopen = resolve
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
      this.eventSubscribers[name]?.(data)
    }
  }

  /**
   * register event
   * @param event event in `MessageEvent`, use `'*'` to receive unnamed event.
   * @param onMessageComing
   */
  on<EventName extends keyof Events>(
    event: EventName | '*',
    onMessageComing: ComingMessageHandler<Events[EventName]>
  ) {
    const name = event === '*' ? 'message' : event as string
    this.eventSubscribers[name] = onMessageComing
    this.event.addEventListener(name, this._onMessageComing(name))

    return this
  }

  /**
   * unregister event
   */
  off<EventName extends keyof Events>(event: EventName) {
    const name = event === '*' ? 'message' : event as string
    this.event.removeEventListener(name, this.eventSubscribers[name])
    delete this.eventSubscribers[name]

    return this
  }

  /**
   * unregister all events
   */
  offAll() {
    forIn(this.eventSubscribers, (fn, name) => {
      this.event.removeEventListener(name, fn)
    })
    this.eventSubscribers = {}
  }

  /**
   * re-register all binding events
   */
  reRegister() {
    forIn(this.eventSubscribers, (fn, name) => {
      this.event.removeEventListener(name, fn)
      this.event.addEventListener(name, fn)
    })
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

  private subscribers: Record<string, EventSource> = {}

  private eventSubscribers: Record<string, SSEEventSubscriber<any>> = {}

  private errorHandler: ErrorHandler<keyof Events>

  private closeHandler: ErrorHandler<keyof Events>

  private retries: Record<string, number> = {}

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

  private _onError(url: string) {
    return async (event: Event) => {
      this.errorHandler?.(url, event)
      this.unsubscribe(url)

      this.retries[url] ??= 0
      this.retries[url] += 1
      if (this.retryConfig.retries && this.retries[url] >= this.retryConfig.retries) {
        console.error(`[SSEClient] Too many retry, this url is no longer subscribed: ${this.baseURL}${url}`, event)
        this.unregister(url)
        this.closeHandler?.(url, event)
        return;
      }

      await sleep(this.retryConfig.interval)
      this.subscribe(url)
    }
  }

  private unregister(url: string) {
    this.eventSubscribers[url]?.offAll()
    delete this.eventSubscribers[url]
    delete this.retries[url]
  }

  subscribe<Url extends keyof Events = ''>(
    url: Url
  ): SSEEventSubscriber<Events[Url]> {
    this.unsubscribe(url)

    const _url = url as string
    const es = new EventSource(`${this.baseURL}${_url}`)
    this.subscribers[_url] = es

    let eventSubscriber = this.eventSubscribers[_url]
    if (eventSubscriber) {
      eventSubscriber.reRegister()
    } else {
      eventSubscriber = new SSEEventSubscriber(es, _url, this.interceptor?.bind(this))
      this.eventSubscribers[_url] = eventSubscriber
    }

    es.onerror = this._onError(url as string)

    return eventSubscriber
  }

  unsubscribe<Url extends keyof Events>(url: Url) {
    const _url = url as string
    this.subscribers[_url]?.close()
    delete this.subscribers[_url]
  }

  onError(onErrorComing: ErrorHandler<keyof Events>) {
    this.errorHandler = onErrorComing
  }

  onClose(onClose: ErrorHandler<keyof Events>) {
    this.closeHandler = onClose
  }
}
