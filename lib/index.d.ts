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
type Milliseconds = number;
type ComingMessageHandler<T = unknown> = (message: T) => void;
type ErrorHandler<T = unknown> = (url: T, message: Event) => void;
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
    retry?: RetryConfig;
}
export type SSEClientSubscriberType = Record<string, unknown>;
export declare class SSEEventSubscriber<Events extends SSEClientSubscriberType> {
    private readonly event;
    private readonly url?;
    private readonly interceptor?;
    private eventSubscribers;
    private waitPromise;
    constructor(event: EventSource, url?: string, interceptor?: SSEClientInterceptor<string>);
    private _onMessageComing;
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
export declare class SSEClient<Events extends Record<string, SSEClientSubscriberType>> {
    private retryConfig;
    private baseURL;
    private subscribers;
    private eventSubscribers;
    private errorHandler;
    private retries;
    private interceptor;
    constructor(config?: SSEClientConfig, interceptor?: SSEClientInterceptor<keyof Events>);
    private _onError;
    private unregister;
    subscribe<Url extends keyof Events = ''>(url: Url): SSEEventSubscriber<Events[Url]>;
    unsubscribe<Url extends keyof Events>(url: Url): void;
    onError(onErrorComing: ErrorHandler<keyof Events>): void;
}
export {};
