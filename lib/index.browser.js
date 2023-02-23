var SSEClient = (function (exports) {
    'use strict';

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

    function usePromise() {
        var _resolve;
        var _reject;
        var promise = new Promise(function (resolve, reject) {
            _resolve = resolve;
            _reject = reject;
        });
        return { promise: promise, resolve: _resolve, reject: _reject };
    }
    function forIn(target, iteratee) {
        Object.keys(target).forEach(function (key) { return iteratee(target[key], key, target); });
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
        function SSEEventSubscriber(event, url, interceptor) {
            this.event = event;
            this.url = url;
            this.interceptor = interceptor;
            this.eventSubscribers = {};
            var _a = usePromise(), promise = _a.promise, resolve = _a.resolve;
            this.waitPromise = promise;
            event.onopen = resolve;
        }
        SSEEventSubscriber.prototype._onMessageComing = function (name) {
            var _this = this;
            return function (event) { return __awaiter(_this, void 0, void 0, function () {
                var data, ret;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            data = event.data;
                            try {
                                data = JSON.parse(data);
                            }
                            catch (_d) { }
                            if (!this.interceptor) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.interceptor(this.url, name, data)];
                        case 1:
                            ret = _c.sent();
                            if (!ret) {
                                return [2 /*return*/];
                            }
                            data = ret;
                            _c.label = 2;
                        case 2:
                            (_b = (_a = this.eventSubscribers)[name]) === null || _b === void 0 ? void 0 : _b.call(_a, data);
                            return [2 /*return*/];
                    }
                });
            }); };
        };
        /**
         * register event
         * @param event event in `MessageEvent`, use `'*'` to receive unnamed event.
         * @param onMessageComing
         */
        SSEEventSubscriber.prototype.on = function (event, onMessageComing) {
            var name = event === '*' ? 'message' : event;
            this.eventSubscribers[name] = onMessageComing;
            this.event.addEventListener(name, this._onMessageComing(name));
            return this;
        };
        /**
         * unregister event
         */
        SSEEventSubscriber.prototype.off = function (event) {
            var name = event === '*' ? 'message' : event;
            this.event.removeEventListener(name, this.eventSubscribers[name]);
            delete this.eventSubscribers[name];
            return this;
        };
        /**
         * unregister all events
         */
        SSEEventSubscriber.prototype.offAll = function () {
            var _this = this;
            forIn(this.eventSubscribers, function (fn, name) {
                _this.event.removeEventListener(name, fn);
            });
            this.eventSubscribers = {};
        };
        /**
         * re-register all binding events
         */
        SSEEventSubscriber.prototype.reRegister = function () {
            var _this = this;
            forIn(this.eventSubscribers, function (fn, name) {
                _this.event.removeEventListener(name, fn);
                _this.event.addEventListener(name, fn);
            });
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
            var _a;
            this.retryConfig = defaultRetryConfig;
            this.subscribers = {};
            this.eventSubscribers = {};
            this.retries = {};
            this.interceptor = null;
            this.baseURL = (_a = config === null || config === void 0 ? void 0 : config.baseURL) !== null && _a !== void 0 ? _a : '';
            this.interceptor = interceptor;
            if (config === null || config === void 0 ? void 0 : config.retry) {
                this.retryConfig = __assign(__assign({}, this.retryConfig), config.retry);
            }
        }
        SSEClient.prototype._onError = function (url) {
            var _this = this;
            return function (event) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, _c;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            (_a = this.errorHandler) === null || _a === void 0 ? void 0 : _a.call(this, url, event);
                            this.unsubscribe(url);
                            (_b = (_d = this.retries)[url]) !== null && _b !== void 0 ? _b : (_d[url] = 0);
                            this.retries[url] += 1;
                            if (this.retryConfig.retries && this.retries[url] >= this.retryConfig.retries) {
                                console.error("[SSEClient] Too many retry, this url is no longer subscribed: ".concat(this.baseURL).concat(url), event);
                                this.unregister(url);
                                (_c = this.closeHandler) === null || _c === void 0 ? void 0 : _c.call(this, url, event);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, sleep(this.retryConfig.interval)];
                        case 1:
                            _e.sent();
                            this.subscribe(url);
                            return [2 /*return*/];
                    }
                });
            }); };
        };
        SSEClient.prototype.unregister = function (url) {
            var _a;
            (_a = this.eventSubscribers[url]) === null || _a === void 0 ? void 0 : _a.offAll();
            delete this.eventSubscribers[url];
        };
        SSEClient.prototype.subscribe = function (url) {
            var _a;
            this.unsubscribe(url);
            var _url = url;
            var es = new EventSource("".concat(this.baseURL).concat(_url));
            this.subscribers[_url] = es;
            var eventSubscriber = this.eventSubscribers[_url];
            if (eventSubscriber) {
                eventSubscriber.reRegister();
            }
            else {
                eventSubscriber = new SSEEventSubscriber(es, _url, (_a = this.interceptor) === null || _a === void 0 ? void 0 : _a.bind(this));
                this.eventSubscribers[_url] = eventSubscriber;
            }
            es.onerror = this._onError(url);
            return eventSubscriber;
        };
        SSEClient.prototype.unsubscribe = function (url) {
            var _a;
            var _url = url;
            (_a = this.subscribers[_url]) === null || _a === void 0 ? void 0 : _a.close();
            delete this.subscribers[_url];
        };
        SSEClient.prototype.onError = function (onErrorComing) {
            this.errorHandler = onErrorComing;
        };
        SSEClient.prototype.onClose = function (onClose) {
            this.closeHandler = onClose;
        };
        return SSEClient;
    }());

    exports.SSEClient = SSEClient;
    exports.SSEEventSubscriber = SSEEventSubscriber;

    return exports;

})({});
//# sourceMappingURL=index.browser.js.map
