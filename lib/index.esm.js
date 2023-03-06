/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

function usePromise() {
    var _resolve;
    var _reject;
    var promise = new Promise(function (resolve, reject) {
        _resolve = resolve;
        _reject = reject;
    });
    return { promise: promise, resolve: _resolve, reject: _reject };
}

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
var sleep = function (time) { return new Promise(function (resolve) {
    setTimeout(resolve, time);
}); };
var defaultRetryConfig = {
    retries: 3,
    interval: 1000
};
Object.freeze(defaultRetryConfig);
var SSEEventSubscriber = /** @class */ (function () {
    function SSEEventSubscriber(eventSource, url, interceptor) {
        this.eventSource = eventSource;
        this.url = url;
        this.interceptor = interceptor;
        this.eventSubscribers = new Map();
        this.emitter = mitt();
        var _a = usePromise(), promise = _a.promise, resolve = _a.resolve;
        this.waitPromise = promise;
        eventSource.onopen = resolve;
        eventSource.addEventListener('message', this._onMessageComing('message'));
    }
    SSEEventSubscriber.prototype._onMessageComing = function (name) {
        var _this = this;
        return function (event) { return __awaiter(_this, void 0, void 0, function () {
            var data, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = event.data;
                        try {
                            data = JSON.parse(data);
                        }
                        catch (_b) { }
                        if (!this.interceptor) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.interceptor(this.url, name, data)];
                    case 1:
                        ret = _a.sent();
                        if (!ret) {
                            return [2 /*return*/];
                        }
                        data = ret;
                        _a.label = 2;
                    case 2:
                        this.emitter.emit(name, data);
                        return [2 /*return*/];
                }
            });
        }); };
    };
    SSEEventSubscriber.prototype.on = function (event, onMessageComing) {
        this.emitter.on(event, onMessageComing);
        var name = event;
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
            && !this.eventSubscribers.has(event)) {
            var fn = this._onMessageComing(name);
            this.eventSubscribers.set(event, fn);
            this.eventSource.addEventListener(name, fn);
        }
        return this;
    };
    SSEEventSubscriber.prototype.off = function (event, onMessageComing) {
        var name = event;
        this.emitter.off(event, onMessageComing);
        if (
        /**
         * always ignore '*' and 'message' when adding / deleting listener
         */
        name !== '*'
            && name !== 'message') {
            var fn = this.eventSubscribers.get(event);
            this.eventSource.removeEventListener(name, fn);
        }
        return this;
    };
    /**
     * unregister all events
     *
     * The same as using `off('*')`
     */
    SSEEventSubscriber.prototype.offAll = function () {
        var _this = this;
        this.emitter.off('*');
        this.eventSubscribers.forEach(function (fn, name) {
            _this.eventSource.removeEventListener(name, fn);
        });
        this.eventSubscribers.clear();
    };
    /**
     * waiting for event source connection established
     */
    SSEEventSubscriber.prototype.waitUntilOpened = function () {
        return this.waitPromise;
    };
    return SSEEventSubscriber;
}());
var SSEClient = /** @class */ (function () {
    function SSEClient(config, interceptor) {
        var _a, _b;
        this.retryConfig = defaultRetryConfig;
        this.subscribers = new Map();
        this.eventSubscribers = new WeakMap();
        this.lastEventTime = new Map();
        this.retries = new Map();
        this.baseURL = (_a = config === null || config === void 0 ? void 0 : config.baseURL) !== null && _a !== void 0 ? _a : '';
        this.interceptor = interceptor;
        this.timeout = (_b = config === null || config === void 0 ? void 0 : config.timeout) !== null && _b !== void 0 ? _b : 60000;
        if (config === null || config === void 0 ? void 0 : config.retry) {
            this.retryConfig = __assign(__assign({}, this.retryConfig), config.retry);
        }
        if (this.timeout) {
            setInterval(this._checkEventTime.bind(this), 100);
        }
    }
    SSEClient.prototype._onError = function (url) {
        var _this = this;
        return function (event) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (_a = this.errorHandler) === null || _a === void 0 ? void 0 : _a.call(this, url, event);
                        this.unsubscribe(url);
                        if (!this.retries.has(url)) {
                            this.retries.set(url, 0);
                        }
                        this.retries.set(url, this.retries.get(url) + 1);
                        if (this.retryConfig.retries && this.retries.get(url) >= this.retryConfig.retries) {
                            console.error("[SSEClient] Too many retry, this url is no longer subscribed: ".concat(this.baseURL).concat(url), event);
                            this.unsubscribe(url);
                            this.retries["delete"](url);
                            (_b = this.closeHandler) === null || _b === void 0 ? void 0 : _b.call(this, url, event);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, sleep(this.retryConfig.interval)];
                    case 1:
                        _c.sent();
                        this.subscribe(url);
                        return [2 /*return*/];
                }
            });
        }); };
    };
    SSEClient.prototype._checkEventTime = function () {
        var _this = this;
        var now = Date.now();
        this.lastEventTime.forEach(function (time, url) {
            var _a;
            if (now - time.getTime() > _this.timeout) {
                (_a = _this.timeoutHandler) === null || _a === void 0 ? void 0 : _a.call(_this, url);
                _this.unsubscribe(url);
            }
        });
    };
    SSEClient.prototype._onMessageComing = function (url) {
        var _this = this;
        return function (_, event, message) {
            _this.lastEventTime.set(url, new Date());
            if (_this.interceptor) {
                return _this.interceptor(url, event, message);
            }
            return message;
        };
    };
    SSEClient.prototype.subscribe = function (url) {
        var subscriber = this.subscribers.get(url);
        var eventSubscriber;
        if (subscriber) {
            eventSubscriber = this.eventSubscribers.get(subscriber);
            if (eventSubscriber) {
                return eventSubscriber;
            }
        }
        subscriber = new EventSource("".concat(this.baseURL).concat(url));
        eventSubscriber = new SSEEventSubscriber(subscriber, url, this._onMessageComing(url));
        this.subscribers.set(url, subscriber);
        this.eventSubscribers.set(subscriber, eventSubscriber);
        subscriber.onerror = this._onError(url);
        return eventSubscriber;
    };
    /**
     * close the connection to server
     */
    SSEClient.prototype.unsubscribe = function (url) {
        var _a;
        var subscriber = this.subscribers.get(url);
        if (!subscriber) {
            return;
        }
        subscriber === null || subscriber === void 0 ? void 0 : subscriber.close();
        (_a = this.closeHandler) === null || _a === void 0 ? void 0 : _a.call(this, url);
        this.subscribers["delete"](url);
        this.lastEventTime["delete"](url);
        this.eventSubscribers["delete"](subscriber);
    };
    SSEClient.prototype.onTimeout = function (timeoutHandler) {
        this.timeoutHandler = timeoutHandler;
    };
    SSEClient.prototype.onError = function (onErrorComing) {
        this.errorHandler = onErrorComing;
    };
    SSEClient.prototype.onClose = function (onClose) {
        this.closeHandler = onClose;
    };
    return SSEClient;
}());

export { SSEClient, SSEEventSubscriber };
//# sourceMappingURL=index.esm.js.map
