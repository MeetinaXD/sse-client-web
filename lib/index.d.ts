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
import { WildcardHandler } from 'mitt';
type Milliseconds = number;
type ComingMessageHandler<T = unknown> = (message: T) => void;
type ErrorHandler<T = unknown> = (url: T, message?: Event) => void;
type SSEClientInterceptor<R, T = unknown> = (url: R, event: string, message: T) => T | Promise<T> | null;
export interface RetryConfig {
    /**
     * How many times should retry after `EventSource.onError` occurred.
     */
    retries?: number;
    /**
     * Specifies the number of milliseconds between each retry, default is 1000
     */
    interval?: Milliseconds;
}
export interface SSEClientConfig {
    /**
     * `baseURL` will be prepended to `url` in `subscribe` or `unsubscribe`
     */
    baseURL?: string;
    /**
     * `timeout` specifies the number of milliseconds before the next response times out.
     * If the response takes longer than `timeout`, the subscribe will be cancelled.
     *
     * We recommend you add a heartbeat reply to ensure the connection is alive.
     *
     * set to 0 means no timeout. default is 60000(60 seconds). min detect interval is 100(ms)
     */
    timeout?: Milliseconds;
    retry?: RetryConfig;
}
export type SSEClientSubscriberType = Record<string, unknown>;
export declare class SSEEventSubscriber<Events extends SSEClientSubscriberType> {
    private readonly eventSource;
    private readonly url?;
    private readonly interceptor?;
    private eventSubscribers;
    private waitPromise;
    private emitter;
    constructor(eventSource: EventSource, url?: string | undefined, interceptor?: SSEClientInterceptor<string, unknown> | undefined);
    private _onMessageComing;
    /**
     * register event
     * @param event event in `MessageEvent`, use `'*'` to receive all event, use `'message'` to receive unnamed event.
     */
    on(event: '*', onMessageComing: WildcardHandler<Events>): this;
    on(event: 'message', onMessageComing: ComingMessageHandler): this;
    on<EventName extends keyof Events>(event: EventName, onMessageComing: ComingMessageHandler<Events[EventName]>): this;
    /**
     * unregister event
     *
     * use `'*'` for all events
     */
    off(event: '*', onMessageComing: WildcardHandler<Events>): this;
    off(event: 'message', onMessageComing?: ComingMessageHandler): this;
    off<EventName extends keyof Events>(event: EventName, onMessageComing?: ComingMessageHandler<Events[EventName]>): this;
    /**
     * unregister all events
     *
     * The same as using `off('*')`
     */
    offAll(): void;
    /**
     * waiting for event source connection established
     */
    waitUntilOpened(): Promise<unknown>;
}
export declare class SSEClient<Events extends Record<string, SSEClientSubscriberType>> {
    private readonly timeout?;
    private retryConfig;
    private baseURL;
    private subscribers;
    private eventSubscribers;
    private lastEventTime;
    private timeoutHandler?;
    private errorHandler?;
    private closeHandler?;
    private retries;
    private interceptor?;
    constructor(config?: SSEClientConfig, interceptor?: SSEClientInterceptor<keyof Events>);
    private _onError;
    private _checkEventTime;
    private _onMessageComing;
    subscribe<Url extends keyof Events>(url: Url): SSEEventSubscriber<Events[Url]>;
    /**
     * close the connection to server
     */
    unsubscribe<Url extends keyof Events>(url: Url): void;
    onTimeout(timeoutHandler: ErrorHandler): void;
    onError(onErrorComing: ErrorHandler<keyof Events>): void;
    onClose(onClose: ErrorHandler<keyof Events>): void;
}
export {};
