(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["search-api"] = factory());
})(this, (function () { 'use strict';

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

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    let nanoid = (size = 21) =>
      crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
        byte &= 63;
        if (byte < 36) {
          id += byte.toString(36);
        } else if (byte < 62) {
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte > 62) {
          id += '-';
        } else {
          id += '_';
        }
        return id
      }, '');

    function createRegistry(options) {
        if (options && options.errorHandling
            && typeof options.errorHandling !== "function"
            && options.errorHandling !== "log"
            && options.errorHandling !== "silent"
            && options.errorHandling !== "throw") {
            throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
        }
        var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
        var callbacks = {};
        function add(key, callback, replayArgumentsArr) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            if (replayArgumentsArr) {
                setTimeout(function () {
                    replayArgumentsArr.forEach(function (replayArgument) {
                        var _a;
                        if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                            try {
                                if (Array.isArray(replayArgument)) {
                                    callback.apply(undefined, replayArgument);
                                }
                                else {
                                    callback.apply(undefined, [replayArgument]);
                                }
                            }
                            catch (err) {
                                _handleError(err, key);
                            }
                        }
                    });
                }, 0);
            }
            return function () {
                var allForKey = callbacks[key];
                if (!allForKey) {
                    return;
                }
                allForKey = allForKey.reduce(function (acc, element, index) {
                    if (!(element === callback && acc.length === index)) {
                        acc.push(element);
                    }
                    return acc;
                }, []);
                if (allForKey.length === 0) {
                    delete callbacks[key];
                }
                else {
                    callbacks[key] = allForKey;
                }
            };
        }
        function execute(key) {
            var argumentsArr = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argumentsArr[_i - 1] = arguments[_i];
            }
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey || callbacksForKey.length === 0) {
                return [];
            }
            var results = [];
            callbacksForKey.forEach(function (callback) {
                try {
                    var result = callback.apply(undefined, argumentsArr);
                    results.push(result);
                }
                catch (err) {
                    results.push(undefined);
                    _handleError(err, key);
                }
            });
            return results;
        }
        function _handleError(exceptionArtifact, key) {
            var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
            if (_userErrorHandler) {
                _userErrorHandler(errParam);
                return;
            }
            var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
            if (options) {
                switch (options.errorHandling) {
                    case "log":
                        return console.error(msg);
                    case "silent":
                        return;
                    case "throw":
                        throw new Error(msg);
                }
            }
            console.error(msg);
        }
        function clear() {
            callbacks = {};
        }
        function clearKey(key) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                return;
            }
            delete callbacks[key];
        }
        return {
            add: add,
            execute: execute,
            clear: clear,
            clearKey: clearKey
        };
    }
    createRegistry.default = createRegistry;
    var lib = createRegistry;

    const SEARCH_QUERY_STATUSES = {
        done: "done",
        inProgress: "in-progress",
        error: "error"
    };
    const CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS = {
        info: "info",
        search: "search",
        cancel: "cancel"
    };

    /**
     * Wraps values in an `Ok` type.
     *
     * Example: `ok(5) // => {ok: true, result: 5}`
     */
    var ok = function (result) { return ({ ok: true, result: result }); };
    /**
     * Wraps errors in an `Err` type.
     *
     * Example: `err('on fire') // => {ok: false, error: 'on fire'}`
     */
    var err = function (error) { return ({ ok: false, error: error }); };
    /**
     * Create a `Promise` that either resolves with the result of `Ok` or rejects
     * with the error of `Err`.
     */
    var asPromise = function (r) {
        return r.ok === true ? Promise.resolve(r.result) : Promise.reject(r.error);
    };
    /**
     * Unwraps a `Result` and returns either the result of an `Ok`, or
     * `defaultValue`.
     *
     * Example:
     * ```
     * Result.withDefault(5, number().run(json))
     * ```
     *
     * It would be nice if `Decoder` had an instance method that mirrored this
     * function. Such a method would look something like this:
     * ```
     * class Decoder<A> {
     *   runWithDefault = (defaultValue: A, json: any): A =>
     *     Result.withDefault(defaultValue, this.run(json));
     * }
     *
     * number().runWithDefault(5, json)
     * ```
     * Unfortunately, the type of `defaultValue: A` on the method causes issues
     * with type inference on  the `object` decoder in some situations. While these
     * inference issues can be solved by providing the optional type argument for
     * `object`s, the extra trouble and confusion doesn't seem worth it.
     */
    var withDefault = function (defaultValue, r) {
        return r.ok === true ? r.result : defaultValue;
    };
    /**
     * Return the successful result, or throw an error.
     */
    var withException = function (r) {
        if (r.ok === true) {
            return r.result;
        }
        else {
            throw r.error;
        }
    };
    /**
     * Apply `f` to the result of an `Ok`, or pass the error through.
     */
    var map = function (f, r) {
        return r.ok === true ? ok(f(r.result)) : r;
    };
    /**
     * Apply `f` to the result of two `Ok`s, or pass an error through. If both
     * `Result`s are errors then the first one is returned.
     */
    var map2 = function (f, ar, br) {
        return ar.ok === false ? ar :
            br.ok === false ? br :
                ok(f(ar.result, br.result));
    };
    /**
     * Apply `f` to the error of an `Err`, or pass the success through.
     */
    var mapError = function (f, r) {
        return r.ok === true ? r : err(f(r.error));
    };
    /**
     * Chain together a sequence of computations that may fail, similar to a
     * `Promise`. If the first computation fails then the error will propagate
     * through. If it succeeds, then `f` will be applied to the value, returning a
     * new `Result`.
     */
    var andThen = function (f, r) {
        return r.ok === true ? f(r.result) : r;
    };

    /*! *****************************************************************************
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
    /* global Reflect, Promise */



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

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null && b === null) {
            return true;
        }
        if (typeof (a) !== typeof (b)) {
            return false;
        }
        if (typeof (a) === 'object') {
            // Array
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            // Hash table
            var keys = Object.keys(a);
            if (keys.length !== Object.keys(b).length) {
                return false;
            }
            for (var i = 0; i < keys.length; i++) {
                if (!b.hasOwnProperty(keys[i])) {
                    return false;
                }
                if (!isEqual(a[keys[i]], b[keys[i]])) {
                    return false;
                }
            }
            return true;
        }
    }
    /*
     * Helpers
     */
    var isJsonArray = function (json) { return Array.isArray(json); };
    var isJsonObject = function (json) {
        return typeof json === 'object' && json !== null && !isJsonArray(json);
    };
    var typeString = function (json) {
        switch (typeof json) {
            case 'string':
                return 'a string';
            case 'number':
                return 'a number';
            case 'boolean':
                return 'a boolean';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (json instanceof Array) {
                    return 'an array';
                }
                else if (json === null) {
                    return 'null';
                }
                else {
                    return 'an object';
                }
            default:
                return JSON.stringify(json);
        }
    };
    var expectedGot = function (expected, got) {
        return "expected " + expected + ", got " + typeString(got);
    };
    var printPath = function (paths) {
        return paths.map(function (path) { return (typeof path === 'string' ? "." + path : "[" + path + "]"); }).join('');
    };
    var prependAt = function (newAt, _a) {
        var at = _a.at, rest = __rest(_a, ["at"]);
        return (__assign({ at: newAt + (at || '') }, rest));
    };
    /**
     * Decoders transform json objects with unknown structure into known and
     * verified forms. You can create objects of type `Decoder<A>` with either the
     * primitive decoder functions, such as `boolean()` and `string()`, or by
     * applying higher-order decoders to the primitives, such as `array(boolean())`
     * or `dict(string())`.
     *
     * Each of the decoder functions are available both as a static method on
     * `Decoder` and as a function alias -- for example the string decoder is
     * defined at `Decoder.string()`, but is also aliased to `string()`. Using the
     * function aliases exported with the library is recommended.
     *
     * `Decoder` exposes a number of 'run' methods, which all decode json in the
     * same way, but communicate success and failure in different ways. The `map`
     * and `andThen` methods modify decoders without having to call a 'run' method.
     *
     * Alternatively, the main decoder `run()` method returns an object of type
     * `Result<A, DecoderError>`. This library provides a number of helper
     * functions for dealing with the `Result` type, so you can do all the same
     * things with a `Result` as with the decoder methods.
     */
    var Decoder = /** @class */ (function () {
        /**
         * The Decoder class constructor is kept private to separate the internal
         * `decode` function from the external `run` function. The distinction
         * between the two functions is that `decode` returns a
         * `Partial<DecoderError>` on failure, which contains an unfinished error
         * report. When `run` is called on a decoder, the relevant series of `decode`
         * calls is made, and then on failure the resulting `Partial<DecoderError>`
         * is turned into a `DecoderError` by filling in the missing information.
         *
         * While hiding the constructor may seem restrictive, leveraging the
         * provided decoder combinators and helper functions such as
         * `andThen` and `map` should be enough to build specialized decoders as
         * needed.
         */
        function Decoder(decode) {
            var _this = this;
            this.decode = decode;
            /**
             * Run the decoder and return a `Result` with either the decoded value or a
             * `DecoderError` containing the json input, the location of the error, and
             * the error message.
             *
             * Examples:
             * ```
             * number().run(12)
             * // => {ok: true, result: 12}
             *
             * string().run(9001)
             * // =>
             * // {
             * //   ok: false,
             * //   error: {
             * //     kind: 'DecoderError',
             * //     input: 9001,
             * //     at: 'input',
             * //     message: 'expected a string, got 9001'
             * //   }
             * // }
             * ```
             */
            this.run = function (json) {
                return mapError(function (error) { return ({
                    kind: 'DecoderError',
                    input: json,
                    at: 'input' + (error.at || ''),
                    message: error.message || ''
                }); }, _this.decode(json));
            };
            /**
             * Run the decoder as a `Promise`.
             */
            this.runPromise = function (json) { return asPromise(_this.run(json)); };
            /**
             * Run the decoder and return the value on success, or throw an exception
             * with a formatted error string.
             */
            this.runWithException = function (json) { return withException(_this.run(json)); };
            /**
             * Construct a new decoder that applies a transformation to the decoded
             * result. If the decoder succeeds then `f` will be applied to the value. If
             * it fails the error will propagated through.
             *
             * Example:
             * ```
             * number().map(x => x * 5).run(10)
             * // => {ok: true, result: 50}
             * ```
             */
            this.map = function (f) {
                return new Decoder(function (json) { return map(f, _this.decode(json)); });
            };
            /**
             * Chain together a sequence of decoders. The first decoder will run, and
             * then the function will determine what decoder to run second. If the result
             * of the first decoder succeeds then `f` will be applied to the decoded
             * value. If it fails the error will propagate through.
             *
             * This is a very powerful method -- it can act as both the `map` and `where`
             * methods, can improve error messages for edge cases, and can be used to
             * make a decoder for custom types.
             *
             * Example of adding an error message:
             * ```
             * const versionDecoder = valueAt(['version'], number());
             * const infoDecoder3 = object({a: boolean()});
             *
             * const decoder = versionDecoder.andThen(version => {
             *   switch (version) {
             *     case 3:
             *       return infoDecoder3;
             *     default:
             *       return fail(`Unable to decode info, version ${version} is not supported.`);
             *   }
             * });
             *
             * decoder.run({version: 3, a: true})
             * // => {ok: true, result: {a: true}}
             *
             * decoder.run({version: 5, x: 'abc'})
             * // =>
             * // {
             * //   ok: false,
             * //   error: {... message: 'Unable to decode info, version 5 is not supported.'}
             * // }
             * ```
             *
             * Example of decoding a custom type:
             * ```
             * // nominal type for arrays with a length of at least one
             * type NonEmptyArray<T> = T[] & { __nonEmptyArrayBrand__: void };
             *
             * const nonEmptyArrayDecoder = <T>(values: Decoder<T>): Decoder<NonEmptyArray<T>> =>
             *   array(values).andThen(arr =>
             *     arr.length > 0
             *       ? succeed(createNonEmptyArray(arr))
             *       : fail(`expected a non-empty array, got an empty array`)
             *   );
             * ```
             */
            this.andThen = function (f) {
                return new Decoder(function (json) {
                    return andThen(function (value) { return f(value).decode(json); }, _this.decode(json));
                });
            };
            /**
             * Add constraints to a decoder _without_ changing the resulting type. The
             * `test` argument is a predicate function which returns true for valid
             * inputs. When `test` fails on an input, the decoder fails with the given
             * `errorMessage`.
             *
             * ```
             * const chars = (length: number): Decoder<string> =>
             *   string().where(
             *     (s: string) => s.length === length,
             *     `expected a string of length ${length}`
             *   );
             *
             * chars(5).run('12345')
             * // => {ok: true, result: '12345'}
             *
             * chars(2).run('HELLO')
             * // => {ok: false, error: {... message: 'expected a string of length 2'}}
             *
             * chars(12).run(true)
             * // => {ok: false, error: {... message: 'expected a string, got a boolean'}}
             * ```
             */
            this.where = function (test, errorMessage) {
                return _this.andThen(function (value) { return (test(value) ? Decoder.succeed(value) : Decoder.fail(errorMessage)); });
            };
        }
        /**
         * Decoder primitive that validates strings, and fails on all other input.
         */
        Decoder.string = function () {
            return new Decoder(function (json) {
                return typeof json === 'string'
                    ? ok(json)
                    : err({ message: expectedGot('a string', json) });
            });
        };
        /**
         * Decoder primitive that validates numbers, and fails on all other input.
         */
        Decoder.number = function () {
            return new Decoder(function (json) {
                return typeof json === 'number'
                    ? ok(json)
                    : err({ message: expectedGot('a number', json) });
            });
        };
        /**
         * Decoder primitive that validates booleans, and fails on all other input.
         */
        Decoder.boolean = function () {
            return new Decoder(function (json) {
                return typeof json === 'boolean'
                    ? ok(json)
                    : err({ message: expectedGot('a boolean', json) });
            });
        };
        Decoder.constant = function (value) {
            return new Decoder(function (json) {
                return isEqual(json, value)
                    ? ok(value)
                    : err({ message: "expected " + JSON.stringify(value) + ", got " + JSON.stringify(json) });
            });
        };
        Decoder.object = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonObject(json) && decoders) {
                    var obj = {};
                    for (var key in decoders) {
                        if (decoders.hasOwnProperty(key)) {
                            var r = decoders[key].decode(json[key]);
                            if (r.ok === true) {
                                // tslint:disable-next-line:strict-type-predicates
                                if (r.result !== undefined) {
                                    obj[key] = r.result;
                                }
                            }
                            else if (json[key] === undefined) {
                                return err({ message: "the key '" + key + "' is required but was not present" });
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else if (isJsonObject(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        Decoder.array = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonArray(json) && decoder) {
                    var decodeValue_1 = function (v, i) {
                        return mapError(function (err$$1) { return prependAt("[" + i + "]", err$$1); }, decoder.decode(v));
                    };
                    return json.reduce(function (acc, v, i) {
                        return map2(function (arr, result) { return arr.concat([result]); }, acc, decodeValue_1(v, i));
                    }, ok([]));
                }
                else if (isJsonArray(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an array', json) });
                }
            });
        };
        Decoder.tuple = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonArray(json)) {
                    if (json.length !== decoders.length) {
                        return err({
                            message: "expected a tuple of length " + decoders.length + ", got one of length " + json.length
                        });
                    }
                    var result = [];
                    for (var i = 0; i < decoders.length; i++) {
                        var nth = decoders[i].decode(json[i]);
                        if (nth.ok) {
                            result[i] = nth.result;
                        }
                        else {
                            return err(prependAt("[" + i + "]", nth.error));
                        }
                    }
                    return ok(result);
                }
                else {
                    return err({ message: expectedGot("a tuple of length " + decoders.length, json) });
                }
            });
        };
        Decoder.union = function (ad, bd) {
            var decoders = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                decoders[_i - 2] = arguments[_i];
            }
            return Decoder.oneOf.apply(Decoder, [ad, bd].concat(decoders));
        };
        Decoder.intersection = function (ad, bd) {
            var ds = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                ds[_i - 2] = arguments[_i];
            }
            return new Decoder(function (json) {
                return [ad, bd].concat(ds).reduce(function (acc, decoder) { return map2(Object.assign, acc, decoder.decode(json)); }, ok({}));
            });
        };
        /**
         * Escape hatch to bypass validation. Always succeeds and types the result as
         * `any`. Useful for defining decoders incrementally, particularly for
         * complex objects.
         *
         * Example:
         * ```
         * interface User {
         *   name: string;
         *   complexUserData: ComplexType;
         * }
         *
         * const userDecoder: Decoder<User> = object({
         *   name: string(),
         *   complexUserData: anyJson()
         * });
         * ```
         */
        Decoder.anyJson = function () { return new Decoder(function (json) { return ok(json); }); };
        /**
         * Decoder identity function which always succeeds and types the result as
         * `unknown`.
         */
        Decoder.unknownJson = function () {
            return new Decoder(function (json) { return ok(json); });
        };
        /**
         * Decoder for json objects where the keys are unknown strings, but the values
         * should all be of the same type.
         *
         * Example:
         * ```
         * dict(number()).run({chocolate: 12, vanilla: 10, mint: 37});
         * // => {ok: true, result: {chocolate: 12, vanilla: 10, mint: 37}}
         * ```
         */
        Decoder.dict = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonObject(json)) {
                    var obj = {};
                    for (var key in json) {
                        if (json.hasOwnProperty(key)) {
                            var r = decoder.decode(json[key]);
                            if (r.ok === true) {
                                obj[key] = r.result;
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        /**
         * Decoder for values that may be `undefined`. This is primarily helpful for
         * decoding interfaces with optional fields.
         *
         * Example:
         * ```
         * interface User {
         *   id: number;
         *   isOwner?: boolean;
         * }
         *
         * const decoder: Decoder<User> = object({
         *   id: number(),
         *   isOwner: optional(boolean())
         * });
         * ```
         */
        Decoder.optional = function (decoder) {
            return new Decoder(function (json) { return (json === undefined || json === null ? ok(undefined) : decoder.decode(json)); });
        };
        /**
         * Decoder that attempts to run each decoder in `decoders` and either succeeds
         * with the first successful decoder, or fails after all decoders have failed.
         *
         * Note that `oneOf` expects the decoders to all have the same return type,
         * while `union` creates a decoder for the union type of all the input
         * decoders.
         *
         * Examples:
         * ```
         * oneOf(string(), number().map(String))
         * oneOf(constant('start'), constant('stop'), succeed('unknown'))
         * ```
         */
        Decoder.oneOf = function () {
            var decoders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                decoders[_i] = arguments[_i];
            }
            return new Decoder(function (json) {
                var errors = [];
                for (var i = 0; i < decoders.length; i++) {
                    var r = decoders[i].decode(json);
                    if (r.ok === true) {
                        return r;
                    }
                    else {
                        errors[i] = r.error;
                    }
                }
                var errorsList = errors
                    .map(function (error) { return "at error" + (error.at || '') + ": " + error.message; })
                    .join('", "');
                return err({
                    message: "expected a value matching one of the decoders, got the errors [\"" + errorsList + "\"]"
                });
            });
        };
        /**
         * Decoder that always succeeds with either the decoded value, or a fallback
         * default value.
         */
        Decoder.withDefault = function (defaultValue, decoder) {
            return new Decoder(function (json) {
                return ok(withDefault(defaultValue, decoder.decode(json)));
            });
        };
        /**
         * Decoder that pulls a specific field out of a json structure, instead of
         * decoding and returning the full structure. The `paths` array describes the
         * object keys and array indices to traverse, so that values can be pulled out
         * of a nested structure.
         *
         * Example:
         * ```
         * const decoder = valueAt(['a', 'b', 0], string());
         *
         * decoder.run({a: {b: ['surprise!']}})
         * // => {ok: true, result: 'surprise!'}
         *
         * decoder.run({a: {x: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b[0]' message: 'path does not exist'}}
         * ```
         *
         * Note that the `decoder` is ran on the value found at the last key in the
         * path, even if the last key is not found. This allows the `optional`
         * decoder to succeed when appropriate.
         * ```
         * const optionalDecoder = valueAt(['a', 'b', 'c'], optional(string()));
         *
         * optionalDecoder.run({a: {b: {c: 'surprise!'}}})
         * // => {ok: true, result: 'surprise!'}
         *
         * optionalDecoder.run({a: {b: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b.c' message: 'expected an object, got "cats"'}
         *
         * optionalDecoder.run({a: {b: {z: 1}}})
         * // => {ok: true, result: undefined}
         * ```
         */
        Decoder.valueAt = function (paths, decoder) {
            return new Decoder(function (json) {
                var jsonAtPath = json;
                for (var i = 0; i < paths.length; i++) {
                    if (jsonAtPath === undefined) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: 'path does not exist'
                        });
                    }
                    else if (typeof paths[i] === 'string' && !isJsonObject(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an object', jsonAtPath)
                        });
                    }
                    else if (typeof paths[i] === 'number' && !isJsonArray(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an array', jsonAtPath)
                        });
                    }
                    else {
                        jsonAtPath = jsonAtPath[paths[i]];
                    }
                }
                return mapError(function (error) {
                    return jsonAtPath === undefined
                        ? { at: printPath(paths), message: 'path does not exist' }
                        : prependAt(printPath(paths), error);
                }, decoder.decode(jsonAtPath));
            });
        };
        /**
         * Decoder that ignores the input json and always succeeds with `fixedValue`.
         */
        Decoder.succeed = function (fixedValue) {
            return new Decoder(function (json) { return ok(fixedValue); });
        };
        /**
         * Decoder that ignores the input json and always fails with `errorMessage`.
         */
        Decoder.fail = function (errorMessage) {
            return new Decoder(function (json) { return err({ message: errorMessage }); });
        };
        /**
         * Decoder that allows for validating recursive data structures. Unlike with
         * functions, decoders assigned to variables can't reference themselves
         * before they are fully defined. We can avoid prematurely referencing the
         * decoder by wrapping it in a function that won't be called until use, at
         * which point the decoder has been defined.
         *
         * Example:
         * ```
         * interface Comment {
         *   msg: string;
         *   replies: Comment[];
         * }
         *
         * const decoder: Decoder<Comment> = object({
         *   msg: string(),
         *   replies: lazy(() => array(decoder))
         * });
         * ```
         */
        Decoder.lazy = function (mkDecoder) {
            return new Decoder(function (json) { return mkDecoder().decode(json); });
        };
        return Decoder;
    }());

    /* tslint:disable:variable-name */
    /** See `Decoder.string` */
    var string = Decoder.string;
    /** See `Decoder.number` */
    var number = Decoder.number;
    /** See `Decoder.boolean` */
    Decoder.boolean;
    /** See `Decoder.anyJson` */
    var anyJson = Decoder.anyJson;
    /** See `Decoder.unknownJson` */
    Decoder.unknownJson;
    /** See `Decoder.constant` */
    var constant = Decoder.constant;
    /** See `Decoder.object` */
    var object = Decoder.object;
    /** See `Decoder.array` */
    var array = Decoder.array;
    /** See `Decoder.tuple` */
    Decoder.tuple;
    /** See `Decoder.dict` */
    Decoder.dict;
    /** See `Decoder.optional` */
    var optional = Decoder.optional;
    /** See `Decoder.oneOf` */
    var oneOf = Decoder.oneOf;
    /** See `Decoder.union` */
    Decoder.union;
    /** See `Decoder.intersection` */
    Decoder.intersection;
    /** See `Decoder.withDefault` */
    Decoder.withDefault;
    /** See `Decoder.valueAt` */
    Decoder.valueAt;
    /** See `Decoder.succeed` */
    Decoder.succeed;
    /** See `Decoder.fail` */
    Decoder.fail;
    /** See `Decoder.lazy` */
    Decoder.lazy;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    const nonNegativeNumberDecoder = number().where((num) => num >= 0, "Expected a non-negative number");
    const searchTypeDecoder = object({
        name: nonEmptyStringDecoder,
        displayName: optional(nonEmptyStringDecoder)
    });
    const providerData = object({
        id: nonEmptyStringDecoder,
        interopId: nonEmptyStringDecoder,
        name: nonEmptyStringDecoder,
        appName: optional(nonEmptyStringDecoder),
        types: optional(array(searchTypeDecoder))
    });
    const providerLimitsDecoder = object({
        maxResults: optional(nonNegativeNumberDecoder),
        maxResultsPerType: optional(nonNegativeNumberDecoder)
    });
    const queryConfigDecoder = object({
        search: nonEmptyStringDecoder,
        providers: optional(array(providerData)),
        types: optional(array(searchTypeDecoder)),
        providerLimits: optional(providerLimitsDecoder)
    });
    const providerRegistrationConfig = object({
        name: nonEmptyStringDecoder,
        types: optional(array(searchTypeDecoder))
    });
    const operationDecoder = oneOf(constant("cancel"), constant("info"), constant("search"));
    const queryStatusDecoder = oneOf(constant("done"), constant("in-progress"), constant("error"));
    const searchCancelRequestDecoder = object({
        id: nonEmptyStringDecoder
    });
    const mainActionDecoder = object({
        method: nonEmptyStringDecoder,
        target: optional(oneOf(object({ instance: nonEmptyStringDecoder }), constant("all"))),
        params: optional(anyJson())
    });
    const secondaryActionDecoder = object({
        name: nonEmptyStringDecoder,
        method: nonEmptyStringDecoder,
        target: optional(oneOf(object({ instance: nonEmptyStringDecoder }), constant("all"))),
        params: optional(anyJson())
    });
    const queryResultDecoder = object({
        type: searchTypeDecoder,
        id: optional(nonEmptyStringDecoder),
        displayName: optional(nonEmptyStringDecoder),
        description: optional(nonEmptyStringDecoder),
        iconURL: optional(nonEmptyStringDecoder),
        metadata: optional(anyJson()),
        action: optional(mainActionDecoder),
        secondaryActions: optional(array(secondaryActionDecoder))
    });
    const legacySearchResultItemDecoder = object({
        type: string(),
        category: optional(string()),
        id: optional(string()),
        displayName: optional(string()),
        description: optional(string()),
        iconURL: optional(string()),
        action: optional(mainActionDecoder)
    });
    const protocolSearchResultsBatchDecoder = object({
        items: array(oneOf(queryResultDecoder, legacySearchResultItemDecoder)),
        provider: optional(providerData),
        queryId: nonEmptyStringDecoder,
        status: constant("in-progress")
    });
    const protocolSearchCompletedDecoder = object({
        items: array(oneOf(queryResultDecoder, legacySearchResultItemDecoder)),
        queryId: nonEmptyStringDecoder,
        status: constant("done")
    });
    const protocolProviderErrorDecoder = object({
        items: array(oneOf(queryResultDecoder, legacySearchResultItemDecoder)),
        provider: optional(providerData),
        queryId: nonEmptyStringDecoder,
        errorMessage: nonEmptyStringDecoder,
        status: constant("error")
    });

    class ClientController {
        constructor(logger, glueController, modelFactory) {
            this.logger = logger;
            this.glueController = glueController;
            this.modelFactory = modelFactory;
            this.registry = lib();
            this.activeQueryLookup = {};
            this.queryIdToMasterIdLookup = {};
            this.pendingDebounce = [];
            this.debounceMS = 0;
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.registerMainClientMethod(this.handleProviderCall.bind(this));
            });
        }
        setDebounceMS(data) {
            this.logger.info(`[${data.commandId}] Setting the debounceMS to: ${data.milliseconds}`);
            this.debounceMS = data.milliseconds;
            this.logger.info(`[${data.commandId}] debounceMS set to: ${data.milliseconds}`);
        }
        getDebounceMS(data) {
            this.logger.info(`[${data.commandId}] Getting the debounceMS`);
            return this.debounceMS;
        }
        query(data, skipDebounce) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.debounceMS && !skipDebounce) {
                    return this.debounceQuery(data);
                }
                const { queryConfig, commandId } = data;
                this.logger.info(`[${commandId}] Initiating a query request`);
                let allProvidersInfo = yield this.glueController.getAllProvidersInfo();
                this.logger.trace(`[${commandId}] Got all available providers: ${JSON.stringify(allProvidersInfo)}`);
                if (queryConfig.providers) {
                    this.logger.info(`[${commandId}] Filtering providers by explicitly allowed providers.`);
                    allProvidersInfo = this.filterProvidersByAllowList(allProvidersInfo, queryConfig.providers);
                }
                if (queryConfig.types) {
                    this.logger.info(`[${commandId}] Filtering providers by explicitly allowed types.`);
                    allProvidersInfo = this.filterProvidersByAllowedTypes(allProvidersInfo, queryConfig.types);
                }
                if (!allProvidersInfo.length) {
                    this.logger.warn(`[${commandId}] There are no providers that can handle the query for ${data.queryConfig.search}`);
                }
                this.logger.info(`[${commandId}] Sending query request to providers: ${JSON.stringify(allProvidersInfo)}`);
                const allQueryResponses = yield this.glueController.sendQueryRequest(queryConfig, allProvidersInfo);
                this.logger.info(`[${commandId}] Received responses from the providers: ${JSON.stringify(allQueryResponses)}`);
                const masterQueryId = this.generateMasterQueryId();
                const queryModel = this.modelFactory.buildClientQueryModel(masterQueryId, this);
                this.logger.info(`[${commandId}] The query is in progress with master id: ${masterQueryId}`);
                this.activeQueryLookup[masterQueryId] = {
                    servers: allQueryResponses,
                    model: queryModel
                };
                allQueryResponses.forEach((response) => {
                    this.queryIdToMasterIdLookup[response.queryId] = masterQueryId;
                });
                if (!allQueryResponses.length) {
                    setTimeout(() => {
                        this.registry.execute(`on-query-completed-${masterQueryId}`);
                        this.cleanUpQuery(masterQueryId);
                    }, 0);
                }
                return queryModel.exposeFacade();
            });
        }
        cancelQuery(masterQueryId, commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                const activeQuery = this.activeQueryLookup[masterQueryId];
                if (!activeQuery) {
                    throw new Error(`[${commandId}] Cannot cancel query: ${masterQueryId}, because this query does not exist`);
                }
                const interopIds = activeQuery.servers;
                this.logger.info(`[${commandId}] Sending cancel query requests`);
                yield Promise.all(interopIds.map((serverId) => {
                    this.logger.trace(`[${commandId}] Sending cancel query request to ${serverId.interopId} with queryId: ${serverId.queryId}`);
                    return this.glueController.sendQueryCancelRequest({ id: serverId.queryId }, { instance: serverId.interopId });
                }));
                this.logger.info(`[${commandId}] The query was cancelled`);
            });
        }
        processClientOnResults(data) {
            return this.registry.add(`on-query-results-${data.masterQueryId}`, data.callback);
        }
        processClientOnCompleted(data) {
            return this.registry.add(`on-query-completed-${data.masterQueryId}`, data.callback);
        }
        processClientOnError(data) {
            return this.registry.add(`on-query-error-${data.masterQueryId}`, data.callback);
        }
        handleProviderCall(args) {
            return __awaiter(this, void 0, void 0, function* () {
                const { status } = args;
                const validatedOperation = queryStatusDecoder.runWithException(status);
                const commandId = nanoid(10);
                switch (validatedOperation) {
                    case SEARCH_QUERY_STATUSES.done:
                        return this.handleQueryCompleted({ completedConfig: args, commandId });
                    case SEARCH_QUERY_STATUSES.inProgress:
                        return this.handleQueryResults({ resultsBatch: args, commandId });
                    case SEARCH_QUERY_STATUSES.error:
                        return this.handleQueryError({ error: args, commandId });
                    default:
                        throw new Error(`Unrecognized status: ${status}`);
                }
            });
        }
        handleQueryResults(data) {
            var _a, _b;
            const { resultsBatch, commandId } = data;
            this.logger.trace(`[${commandId}] Processing a results batch from provider: ${(_a = resultsBatch.provider) === null || _a === void 0 ? void 0 : _a.name} with id: ${(_b = resultsBatch.provider) === null || _b === void 0 ? void 0 : _b.id}`);
            const verifiedResultsBatch = protocolSearchResultsBatchDecoder.runWithException(resultsBatch);
            const masterQueryId = this.queryIdToMasterIdLookup[verifiedResultsBatch.queryId];
            if (!masterQueryId) {
                this.logger.warn(`[${commandId}] Received results for an unknown query. Provider ${JSON.stringify(verifiedResultsBatch.provider)}, items: ${JSON.stringify(verifiedResultsBatch.items)}`);
                return;
            }
            this.logger.trace(`[${commandId}] The results batch is validated, forwarding to the callbacks`);
            const translatedResults = this.checkTransformLegacyResults(verifiedResultsBatch.items);
            const results = {
                provider: verifiedResultsBatch.provider,
                results: translatedResults
            };
            this.registry.execute(`on-query-results-${masterQueryId}`, results);
        }
        handleQueryCompleted(data) {
            const { completedConfig, commandId } = data;
            this.logger.trace(`[${commandId}] Processing a query completed message from query id: ${completedConfig.queryId}`);
            const verifiedCompleteConfig = protocolSearchCompletedDecoder.runWithException(completedConfig);
            const masterQueryId = this.queryIdToMasterIdLookup[verifiedCompleteConfig.queryId];
            if (!masterQueryId) {
                this.logger.warn(`[${commandId}] Received completed message for an unknown query. Provider query id: ${JSON.stringify(verifiedCompleteConfig.queryId)}`);
                return;
            }
            if (verifiedCompleteConfig.items.length) {
                const translatedResults = this.checkTransformLegacyResults(verifiedCompleteConfig.items);
                const results = {
                    results: translatedResults
                };
                this.registry.execute(`on-query-results-${masterQueryId}`, results);
            }
            delete this.queryIdToMasterIdLookup[verifiedCompleteConfig.queryId];
            const activeQuery = this.activeQueryLookup[masterQueryId];
            activeQuery.servers = activeQuery.servers.filter((server) => server.queryId !== verifiedCompleteConfig.queryId);
            if (activeQuery.servers.length) {
                this.logger.trace(`[${commandId}] Waiting for more providers to complete`);
                return;
            }
            this.logger.trace(`[${commandId}] All providers are done, marking this query as completed`);
            this.registry.execute(`on-query-completed-${masterQueryId}`);
            this.cleanUpQuery(masterQueryId);
        }
        handleQueryError(data) {
            const { error, commandId } = data;
            this.logger.trace(`[${commandId}] Processing an error message from query: ${error.queryId}`);
            const validatedError = protocolProviderErrorDecoder.runWithException(error);
            const masterQueryId = this.queryIdToMasterIdLookup[validatedError.queryId];
            if (!masterQueryId) {
                this.logger.warn(`[${commandId}] Received error message for an unknown query. Provider query id: ${JSON.stringify(validatedError.queryId)} and message: ${JSON.stringify(validatedError.errorMessage)}`);
                return;
            }
            const queryError = {
                error: validatedError.errorMessage,
                provider: validatedError.provider
            };
            this.registry.execute(`on-query-error-${masterQueryId}`, queryError);
        }
        filterProvidersByAllowList(servers, allowed) {
            const allowedLookup = allowed.reduce((lookup, allowedEntry) => {
                lookup[allowedEntry.id] = true;
                return lookup;
            }, {});
            return servers.filter((server) => {
                const serverProviders = server.info.providers;
                return serverProviders.some((provider) => allowedLookup[provider.id]);
            });
        }
        filterProvidersByAllowedTypes(servers, allowed) {
            const allowedLookup = allowed.reduce((lookup, allowedEntry) => {
                lookup[allowedEntry.name] = true;
                return lookup;
            }, {});
            return servers.filter((server) => {
                const allTypes = server.info.supportedTypes;
                return allTypes.some((supportedType) => allowedLookup[supportedType]);
            });
        }
        generateMasterQueryId() {
            const queryId = nanoid(10);
            if (this.activeQueryLookup[queryId]) {
                return this.generateMasterQueryId();
            }
            return queryId;
        }
        cleanUpQuery(masterQueryId) {
            this.registry.clearKey(`on-query-results-${masterQueryId}`);
            this.registry.clearKey(`on-query-completed-${masterQueryId}`);
            this.registry.clearKey(`on-query-error-${masterQueryId}`);
            delete this.activeQueryLookup[masterQueryId];
        }
        debounceQuery(data) {
            return new Promise((res, rej) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    const currentPending = [...this.pendingDebounce];
                    this.pendingDebounce = [];
                    this.query(data, true)
                        .then((query) => currentPending.forEach(({ resolve }) => resolve(query)))
                        .catch((error) => currentPending.forEach(({ reject }) => reject(error)));
                }, this.debounceMS);
                this.pendingDebounce.push({ resolve: res, reject: rej });
            });
        }
        checkTransformLegacyResults(items) {
            if (!items.length) {
                return [];
            }
            const sampleItem = items[0];
            if (!sampleItem || typeof sampleItem.type === "object") {
                return items;
            }
            return items.map((item) => {
                return {
                    type: { name: item.type, displayName: item.category },
                    id: item.id,
                    displayName: item.displayName,
                    description: item.description,
                    iconURL: item.iconURL,
                    action: item.action
                };
            });
        }
    }

    const MAIN_PROVIDER_METHOD_NAME = "T42.Search.Provider";
    const MAIN_CLIENT_METHOD_NAME = "T42.Search.Client";
    const SEQUELIZER_INTERVAL_MS = 10;
    const FLUSH_SEQUELIZER_INTERVAL_MS = 10;
    const FLUSH_TIMEOUT_MS = 100;
    const STALE_QUERY_TIMEOUT_MS = 900000;

    class GlueController {
        constructor(glue) {
            this.glue = glue;
        }
        get myAppName() {
            return this.glue.interop.instance.applicationName;
        }
        get myInteropId() {
            return this.glue.interop.instance.instance;
        }
        registerMainProviderMethod(handler) {
            return __awaiter(this, void 0, void 0, function* () {
                const mainMethodStatus = this.checkMyMethodExists(MAIN_PROVIDER_METHOD_NAME);
                if (mainMethodStatus.exists) {
                    return;
                }
                yield this.glue.interop.register(MAIN_PROVIDER_METHOD_NAME, handler);
            });
        }
        registerMainClientMethod(handler) {
            return __awaiter(this, void 0, void 0, function* () {
                const mainMethodStatus = this.checkMyMethodExists(MAIN_PROVIDER_METHOD_NAME);
                if (mainMethodStatus.exists) {
                    return;
                }
                yield this.glue.interop.register(MAIN_CLIENT_METHOD_NAME, handler);
            });
        }
        clearMainProviderMethod() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glue.interop.unregister(MAIN_PROVIDER_METHOD_NAME);
            });
        }
        sendClientResultsBatch(batch, clientInstanceId, queryId) {
            return __awaiter(this, void 0, void 0, function* () {
                const interopArguments = {
                    items: batch.results,
                    provider: batch.provider,
                    queryId,
                    status: SEARCH_QUERY_STATUSES.inProgress
                };
                yield this.glue.interop.invoke(MAIN_CLIENT_METHOD_NAME, interopArguments, { instance: clientInstanceId });
            });
        }
        sendClientQueueCompleted(clientInstanceId, queryId) {
            return __awaiter(this, void 0, void 0, function* () {
                const interopArguments = {
                    items: [],
                    queryId,
                    status: SEARCH_QUERY_STATUSES.done
                };
                yield this.glue.interop.invoke(MAIN_CLIENT_METHOD_NAME, interopArguments, { instance: clientInstanceId });
            });
        }
        sendClientErrorMessage(error, clientInstanceId, queryId, provider) {
            return __awaiter(this, void 0, void 0, function* () {
                const interopArguments = {
                    items: [],
                    provider,
                    errorMessage: error,
                    queryId,
                    status: SEARCH_QUERY_STATUSES.error
                };
                yield this.glue.interop.invoke(MAIN_CLIENT_METHOD_NAME, interopArguments, { instance: clientInstanceId });
            });
        }
        sendQueryRequest(queryConfig, instances) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!instances.length) {
                    return [];
                }
                const target = instances.map((inst) => ({ instance: inst.interopId }));
                const invokeArgs = Object.assign({ operation: CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.search, apiVersion: "1" }, queryConfig);
                const response = yield this.glue.interop.invoke(MAIN_PROVIDER_METHOD_NAME, invokeArgs, target);
                const allReturned = response.all_return_values || [];
                return allReturned.map((returnValue) => {
                    var _a;
                    return {
                        interopId: (_a = returnValue.executed_by) === null || _a === void 0 ? void 0 : _a.instance,
                        queryId: returnValue.returned.id
                    };
                });
            });
        }
        sendQueryCancelRequest(request, instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const args = {
                    operation: CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.cancel,
                    id: request.id
                };
                yield this.glue.interop.invoke(MAIN_PROVIDER_METHOD_NAME, args, instance);
            });
        }
        getAllProvidersInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.glue.interop.methods().every((method) => method.name !== MAIN_PROVIDER_METHOD_NAME)) {
                    return [];
                }
                const args = {
                    operation: CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.info
                };
                const response = yield this.glue.interop.invoke(MAIN_PROVIDER_METHOD_NAME, args, "all");
                const allReturned = response.all_return_values || [];
                return allReturned.map((returnValue) => {
                    var _a, _b, _c, _d, _e;
                    const isLegacy = typeof returnValue.returned.apiVersion === "undefined";
                    const info = isLegacy ? {
                        supportedTypes: returnValue.returned.supportedTypes,
                        apiVersion: returnValue.returned.apiVersion,
                        providers: [{
                                interopId: (_a = returnValue.executed_by) === null || _a === void 0 ? void 0 : _a.instance,
                                id: (_b = returnValue.executed_by) === null || _b === void 0 ? void 0 : _b.instance,
                                name: (_c = returnValue.executed_by) === null || _c === void 0 ? void 0 : _c.instance,
                                appName: (_d = response.executed_by) === null || _d === void 0 ? void 0 : _d.application,
                                types: returnValue.returned.supportedTypes.map((t) => ({ name: t }))
                            }]
                    } : returnValue.returned;
                    return {
                        interopId: (_e = returnValue.executed_by) === null || _e === void 0 ? void 0 : _e.instance,
                        info
                    };
                });
            });
        }
        checkMyMethodExists(methodName) {
            const myMethods = this.glue.interop.methodsForInstance({ instance: this.glue.interop.instance.instance });
            return { exists: myMethods.some((method) => method.name === methodName) };
        }
    }

    class MainController {
        constructor(logger, glueController, clientController, providerController) {
            this.logger = logger;
            this.glueController = glueController;
            this.clientController = clientController;
            this.providerController = providerController;
        }
        setDebounceMS(data) {
            this.logger.info(`[${data.commandId}] Starting setDebounceMS operation with duration ${data.milliseconds}`);
            this.clientController.setDebounceMS(data);
            this.logger.info(`[${data.commandId}] Operation setDebounceMS with duration ${data.milliseconds} completed`);
        }
        getDebounceMS(data) {
            this.logger.info(`[${data.commandId}] Starting getDebounceMS operation.`);
            return this.clientController.getDebounceMS(data);
        }
        query(data) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${data.commandId}] Starting query operation with config ${JSON.stringify(data.queryConfig)}`);
                if (Array.isArray(data.queryConfig.providers) && !data.queryConfig.providers.length) {
                    throw new Error("Cannot sent a query with a defined empty array of providers, because this is an impossible query for complete.");
                }
                if (Array.isArray(data.queryConfig.types) && !data.queryConfig.types.length) {
                    throw new Error("Cannot sent a query with a defined empty array of types, because this is an impossible query for complete.");
                }
                const query = yield this.clientController.query(data);
                this.logger.info(`[${data.commandId}] Operation query with config ${JSON.stringify(data.queryConfig)} completed.`);
                return query;
            });
        }
        registerProvider(data) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${data.commandId}] Starting registerProvider operation with config ${JSON.stringify(data.config)}`);
                const provider = yield this.providerController.processRegisterProvider(data);
                this.logger.info(`[${data.commandId}] Operation registerProvider with config ${JSON.stringify(data.config)} completed.`);
                return provider;
            });
        }
        providers(data) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${data.commandId}] Starting providers operation.`);
                const allProvidersInfo = yield this.glueController.getAllProvidersInfo();
                const allProvidersData = allProvidersInfo.flatMap((provInfo) => provInfo.info.providers);
                this.logger.info(`[${data.commandId}] Operation providers completed.`);
                return allProvidersData;
            });
        }
        types(data) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${data.commandId}] Starting types operation.`);
                const allProvidersInfo = yield this.glueController.getAllProvidersInfo();
                const allProvidersData = allProvidersInfo.flatMap((provInfo) => provInfo.info.providers);
                const allSupportedTypes = allProvidersData.filter((provData) => !!provData.types).flatMap((provData) => provData.types);
                const uniqueSupportedTypes = [...new Set(allSupportedTypes)];
                this.logger.info(`[${data.commandId}] Operation types completed.`);
                return uniqueSupportedTypes;
            });
        }
    }

    const extractErrorMsg = (error) => {
        const stringError = typeof error === "string" ?
            error :
            error.message ? JSON.stringify(error.message) :
                JSON.stringify(error);
        return stringError;
    };

    class ProviderController {
        constructor(logger, glueController, sequelizer, limitsTracker, modelsFactory) {
            this.logger = logger;
            this.glueController = glueController;
            this.sequelizer = sequelizer;
            this.limitsTracker = limitsTracker;
            this.modelsFactory = modelsFactory;
            this.registry = lib();
            this.providersModels = {};
            this.activeQueries = {};
        }
        processRegisterProvider(data) {
            return __awaiter(this, void 0, void 0, function* () {
                const { config, commandId } = data;
                this.logger.info(`[${commandId}] enqueueing the provider registration process with config: ${JSON.stringify(config)}`);
                const result = yield this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                    const allProvidersInfo = yield this.glueController.getAllProvidersInfo();
                    const allProvidersData = allProvidersInfo.flatMap((provInfo) => provInfo.info.providers);
                    if (allProvidersData.some((providerData) => providerData && providerData.name === config.name)) {
                        throw new Error(`Cannot register a new provider with name: ${config.name}, because there already is a provider with this name`);
                    }
                    yield this.glueController.registerMainProviderMethod(this.handleSearchQueryRequest.bind(this));
                    const modelData = {
                        id: nanoid(10),
                        name: config.name,
                        interopId: this.glueController.myInteropId,
                        appName: this.glueController.myAppName,
                        types: config.types
                    };
                    const model = this.modelsFactory.buildProviderModel(modelData, this);
                    this.providersModels[modelData.id] = model;
                    return model.exposeFacade();
                }));
                this.logger.info(`[${commandId}] the provider with name: ${config.name} has been registered.`);
                return result;
            });
        }
        processProviderOnQuery(data) {
            return this.registry.add(`on-search-query-${data.id}`, data.callback);
        }
        processProviderOnQueryCancel(data) {
            return this.registry.add(`on-cancel-query-${data.id}`, data.callback);
        }
        processProviderUnregister(data) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${data.commandId}] enqueueing the provider un-registration with id: ${data.id}`);
                yield this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                    this.cleanUpProvider(data.id, data.commandId);
                    if (Object.keys(this.providersModels).length) {
                        return;
                    }
                    yield this.glueController.clearMainProviderMethod();
                }));
                this.logger.info(`[${data.commandId}] the provider un-registration with id: ${data.id} completed`);
            });
        }
        processProviderQueryDone(command) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const { commandId, identification } = command;
                (_a = this.activeQueries[identification.queryId]) === null || _a === void 0 ? void 0 : _a.publisher.syncSuspendProvider(identification.providerId, commandId);
                yield this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                    this.logger.trace(`[${commandId}] Processing a query done command with identification: ${JSON.stringify(identification)}`);
                    const activeQuery = this.activeQueries[identification.queryId];
                    if (!activeQuery) {
                        this.logger.warn(`[${commandId}] Cannot mark provider: ${identification.providerId} done with query ${identification.queryId}, because there is no active query with this id`);
                        return;
                    }
                    yield this.cleanUpProviderQuery(identification.queryId, identification.providerId, commandId);
                    if (activeQuery.providersAtWork.length) {
                        this.logger.trace(`[${commandId}] Query done command completed, but there are more providers still at work.`);
                        return;
                    }
                    this.cleanUpQuery(identification.queryId, commandId);
                    this.logger.trace(`[${commandId}] Query is completed, signalling.`);
                }));
            });
        }
        processProviderQueryError(command) {
            var _a;
            const { commandId, identification, error } = command;
            this.logger.warn(`[${commandId}] Processing an error sent by provider: ${identification.providerId} for query id: ${identification.queryId} -> ${error}`);
            (_a = this.activeQueries[identification.queryId]) === null || _a === void 0 ? void 0 : _a.publisher.markProviderError(command);
            return this.processProviderQueryDone(command);
        }
        processProviderQueryResult(command) {
            const { commandId, identification } = command;
            const activeQuery = this.activeQueries[identification.queryId];
            if (!activeQuery) {
                const errorMessage = `Will not send this result to the client, because there is no active query with id ${identification.queryId}. Most likely this query was cancelled.`;
                this.logger.warn(`[${command}] ${errorMessage}`);
                throw new Error(errorMessage);
            }
            if (activeQuery.publisher.checkProviderSuspended(identification.providerId)) {
                const errorMessage = `Will not send this result to the client, because there is no info about this provider in the active query with id ${identification.queryId}. Most likely this query was marked as done by this provider already.`;
                this.logger.warn(`[${command}] ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const requestedTypes = activeQuery.requestedTypes;
            if (requestedTypes && requestedTypes.every((searchType) => searchType.name !== command.result.type.name)) {
                const errorMessage = `Will not send this result to the client, because this result has a defined type: ${command.result.type.name} which is not in the explicitly requested list of types by the client.`;
                this.logger.warn(`[${command}] ${errorMessage}`);
                throw new Error(errorMessage);
            }
            const testResult = this.limitsTracker.testResultLimit(command);
            if (testResult === null || testResult === void 0 ? void 0 : testResult.maxLimitHit) {
                const errorMessage = `Will not process this result from provider ${command.identification.providerId}, because this provider has reached the max results limit set by the client. This provider cannot send more result, marking it as done.`;
                this.logger.info(errorMessage);
                setTimeout(() => this.processProviderQueryDone(command), 0);
                throw new Error(errorMessage);
            }
            if (testResult === null || testResult === void 0 ? void 0 : testResult.maxLimitPerTypeHit) {
                const errorMessage = `Will not process this result from provider ${command.identification.providerId}, because this provider has reached the max results limit per type as set by the client.`;
                this.logger.info(errorMessage);
                throw new Error(errorMessage);
            }
            this.logger.trace(`[${commandId}] An active query for query ${identification.queryId} was found and the provider is within limits, queueing the result`);
            activeQuery.publisher.queueResult(command);
            this.logger.trace(`[${commandId}] The query result was queued successfully.`);
        }
        handleSearchQueryRequest(args, caller) {
            return __awaiter(this, void 0, void 0, function* () {
                const { operation } = args;
                const validatedOperation = operationDecoder.runWithException(operation);
                const commandId = nanoid(10);
                switch (validatedOperation) {
                    case CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.info:
                        return this.handleInfoOperation({ commandId });
                    case CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.search:
                        return this.handleSearchOperation({ args, commandId }, caller);
                    case CLIENT_TO_PROVIDER_PROTOCOL_OPERATIONS.cancel:
                        return this.handleCancelOperation({ args, commandId });
                    default:
                        throw new Error(`Unrecognized operation: ${operation}`);
                }
            });
        }
        handleInfoOperation(request) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${request.commandId}] handling an info operation`);
                const allSupportedTypes = Object.values(this.providersModels).flatMap((providerModel) => providerModel.myProviderData.types || []);
                const uniqueSupportedTypes = [...new Set(allSupportedTypes)];
                const providers = Object.values(this.providersModels).map((providerModel) => providerModel.myProviderData);
                const response = {
                    supportedTypes: uniqueSupportedTypes.map((supportedType) => supportedType.name),
                    providers: providers,
                    apiVersion: "1"
                };
                this.logger.info(`[${request.commandId}] responding to an info operation with: ${JSON.stringify(response)}`);
                return response;
            });
        }
        handleSearchOperation(request, caller) {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = request.commandId;
                const queryId = this.generateQueryId();
                this.logger.info(`[${commandId}] Processing search operation with queryId: ${queryId} request details: ${JSON.stringify(request.args)}`);
                const isLegacyRequest = this.checkRequestLegacy(request.args);
                const validatedRequest = this.prepareRequest(request.args, isLegacyRequest, commandId);
                this.logger.info(`[${commandId}] Search operation with queryId: ${queryId} is validated. Creating an active query and enqueueing calling the providers.`);
                this.activeQueries[queryId] = {
                    queryId,
                    callerInstanceId: caller.instance,
                    providersAtWork: [],
                    requestedTypes: validatedRequest.types,
                    publisher: this.modelsFactory.buildPublisher(caller.instance, queryId, isLegacyRequest),
                    staleTimer: this.setClearStaleQueryTimer(queryId)
                };
                if (validatedRequest.providerLimits) {
                    this.limitsTracker.enableTracking(validatedRequest.providerLimits, queryId);
                }
                setTimeout(() => {
                    this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.logger.info(`[${commandId}] Calling the providers.`);
                            this.callProviders(validatedRequest, queryId, commandId);
                        }
                        catch (error) {
                            this.logger.error(`[${commandId}] Error calling the providers: ${extractErrorMsg(error)}`);
                        }
                    }));
                }, 0);
                this.logger.info(`[${commandId}] Search operation with queryID: ${queryId} processed successfully.`);
                return { id: queryId };
            });
        }
        handleCancelOperation(request) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                    const validation = searchCancelRequestDecoder.run(request.args);
                    if (!validation.ok) {
                        const errorMsg = `Cannot process a cancel request, because of validation error: ${JSON.stringify(validation.error)}`;
                        this.logger.warn(`[${request.commandId}] ${errorMsg}`);
                        throw new Error(errorMsg);
                    }
                    const validatedRequest = validation.result;
                    const activeQuery = this.activeQueries[validatedRequest.id];
                    if (!activeQuery) {
                        return;
                    }
                    clearTimeout(activeQuery.staleTimer);
                    activeQuery.publisher.cancel(request.commandId);
                    delete this.activeQueries[validatedRequest.id];
                    activeQuery.providersAtWork.forEach((provider) => this.registry.execute(`on-cancel-query-${provider.myProviderData.id}`, { id: validatedRequest.id }));
                }));
            });
        }
        generateQueryId() {
            const queryId = nanoid(10);
            if (this.activeQueries[queryId]) {
                return this.generateQueryId();
            }
            return queryId;
        }
        translateLegacySearchRequest(legacyRequest) {
            var _a;
            return {
                search: legacyRequest.search,
                types: (_a = legacyRequest.types) === null || _a === void 0 ? void 0 : _a.map((searchType) => ({ name: searchType })),
                providerLimits: {
                    maxResults: legacyRequest.limit,
                    maxResultsPerType: legacyRequest.categoryLimit
                }
            };
        }
        checkRequestLegacy(searchRequest) {
            return typeof searchRequest.apiVersion === "undefined";
        }
        callProviders(validatedRequest, queryId, commandId) {
            let providers = validatedRequest.providers ?
                this.getFilteredProviderModels(validatedRequest.providers)
                : Object.values(this.providersModels);
            this.logger.trace(`[${commandId}] initial providers filtration yielded: ${JSON.stringify(providers.map((p) => p.myProviderData.name).join(", "))}`);
            providers = validatedRequest.types ? this.getFilteredProvidersBySearchTypes(providers, validatedRequest.types) : providers;
            this.logger.trace(`[${commandId}] search type providers filtration yielded: ${JSON.stringify(providers.map((p) => p.myProviderData.name).join(", "))}`);
            this.activeQueries[queryId].publisher.configureProviders(providers);
            this.activeQueries[queryId].providersAtWork.push(...providers);
            providers.forEach((provider) => this.callProvider(provider, validatedRequest, queryId, commandId));
        }
        callProvider(provider, validatedRequest, queryId, commandId) {
            const queryModel = this.modelsFactory.buildProviderQueryModel(validatedRequest, { queryId, providerId: provider.myProviderData.id }, this);
            const queryFacade = queryModel.exposeFacade();
            this.logger.info(`[${commandId}] The query facade for provider: ${provider.myProviderData.id} with name ${provider.myProviderData.name} is ready, raising the event for query ID: ${queryId}.`);
            this.registry.execute(`on-search-query-${provider.myProviderData.id}`, queryFacade);
        }
        getFilteredProviderModels(providers) {
            const filtered = providers.reduce((providers, provider) => {
                if (this.providersModels[provider.id]) {
                    providers.push(this.providersModels[provider.id]);
                }
                return providers;
            }, []);
            return filtered;
        }
        getFilteredProvidersBySearchTypes(providers, searchTypes) {
            const filtered = providers.filter((provider) => {
                var _a;
                return (_a = provider.myProviderData.types) === null || _a === void 0 ? void 0 : _a.some((providerSearchType) => searchTypes.some((searchType) => searchType.name === providerSearchType.name));
            });
            return filtered;
        }
        setClearStaleQueryTimer(queryId) {
            return setTimeout(() => {
                const commandId = nanoid(10);
                this.logger.info(`[${commandId}] Stale query timer is activated for queryId: ${queryId}`);
                const activeQuery = this.activeQueries[queryId];
                if (!activeQuery) {
                    this.logger.info(`[${commandId}] No active query was found, this was a false activation.`);
                    return;
                }
                this.logger.info(`[${commandId}] force-marking the query as done`);
                this.cleanUpQuery(queryId, commandId);
                this.logger.info(`[${commandId}] the stale query was cleared.`);
            }, STALE_QUERY_TIMEOUT_MS);
        }
        prepareRequest(searchRequest, isLegacyRequest, commandId) {
            const parsedRequest = isLegacyRequest ? this.translateLegacySearchRequest(searchRequest) : searchRequest;
            const validation = queryConfigDecoder.run(parsedRequest);
            if (!validation.ok) {
                const errorMsg = `Cannot process a search request, because of validation error: ${JSON.stringify(validation.error)}`;
                this.logger.warn(`[${commandId}] ${errorMsg}`);
                throw new Error(errorMsg);
            }
            const validatedRequest = validation.result;
            return validatedRequest;
        }
        cleanUpQuery(queryId, commandId) {
            const activeQuery = this.activeQueries[queryId];
            clearTimeout(activeQuery.staleTimer);
            activeQuery.publisher.cleanPublisher(commandId);
            delete this.activeQueries[queryId];
            this.limitsTracker.cleanTracking(queryId);
        }
        cleanUpProvider(providerId, commandId) {
            this.registry.clearKey(`on-search-query-${providerId}`);
            this.registry.clearKey(`on-cancel-query-${providerId}`);
            delete this.providersModels[providerId];
            const queriesWithProvider = Object.values(this.activeQueries).filter((query) => !query.publisher.checkProviderSuspended(providerId));
            queriesWithProvider.forEach((query) => {
                this.processProviderQueryDone({
                    identification: {
                        queryId: query.queryId,
                        providerId
                    },
                    commandId
                });
            });
        }
        cleanUpProviderQuery(queryId, providerId, commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                const activeQuery = this.activeQueries[queryId];
                if (!activeQuery) {
                    this.logger.warn(`[${commandId}] Cannot clean up a provider query ${queryId} for provider ${providerId} because there is no such active query`);
                    return;
                }
                activeQuery.providersAtWork = activeQuery.providersAtWork.filter((provider) => provider.myProviderData.id !== providerId);
                yield activeQuery.publisher.markProviderDone(providerId, commandId);
            });
        }
    }

    var version = "1.1.0";

    class SearchFacade {
        constructor(main) {
            this.main = main;
        }
        exposeApi() {
            const api = {
                version,
                setDebounceMS: this.setDebounceMS.bind(this),
                getDebounceMS: this.getDebounceMS.bind(this),
                listProviders: this.providers.bind(this),
                listTypes: this.types.bind(this),
                query: this.query.bind(this),
                registerProvider: this.registerProvider.bind(this)
            };
            return Object.freeze(api);
        }
        setDebounceMS(milliseconds) {
            nonNegativeNumberDecoder.runWithException(milliseconds);
            const commandId = nanoid(10);
            return this.main.setDebounceMS({ milliseconds, commandId });
        }
        getDebounceMS() {
            const commandId = nanoid(10);
            return this.main.getDebounceMS({ commandId });
        }
        providers() {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = nanoid(10);
                return this.main.providers({ commandId });
            });
        }
        types() {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = nanoid(10);
                return this.main.types({ commandId });
            });
        }
        query(queryConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                const verifiedConfig = queryConfigDecoder.runWithException(queryConfig);
                const commandId = nanoid(10);
                return this.main.query({ queryConfig: verifiedConfig, commandId });
            });
        }
        registerProvider(config) {
            return __awaiter(this, void 0, void 0, function* () {
                const verifiedConfig = providerRegistrationConfig.runWithException(config);
                const commandId = nanoid(10);
                return this.main.registerProvider({ config: verifiedConfig, commandId });
            });
        }
    }

    class AsyncSequelizer {
        constructor(minSequenceInterval = 0) {
            this.minSequenceInterval = minSequenceInterval;
            this.queue = [];
            this.isExecutingQueue = false;
        }
        enqueue(action) {
            return new Promise((resolve, reject) => {
                this.queue.push({ action, resolve, reject });
                this.executeQueue();
            });
        }
        executeQueue() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isExecutingQueue) {
                    return;
                }
                this.isExecutingQueue = true;
                while (this.queue.length) {
                    const operation = this.queue.shift();
                    if (!operation) {
                        this.isExecutingQueue = false;
                        return;
                    }
                    try {
                        const actionResult = yield operation.action();
                        operation.resolve(actionResult);
                    }
                    catch (error) {
                        operation.reject(error);
                    }
                    yield this.intervalBreak();
                }
                this.isExecutingQueue = false;
            });
        }
        intervalBreak() {
            return new Promise((res) => setTimeout(res, this.minSequenceInterval));
        }
    }

    class LimitsTracker {
        constructor() {
            this.limitsLookup = {};
            this.limitsData = {};
        }
        enableTracking(limits, queryId) {
            this.limitsLookup[queryId] = {};
            this.limitsData[queryId] = {
                maxResults: limits.maxResults ? limits.maxResults : Number.MAX_SAFE_INTEGER,
                maxResultsPerType: limits.maxResultsPerType ? limits.maxResultsPerType : Number.MAX_SAFE_INTEGER
            };
        }
        testResultLimit(command) {
            const foundLookup = this.limitsLookup[command.identification.queryId];
            const limitData = this.limitsData[command.identification.queryId];
            if (!foundLookup || !limitData) {
                return;
            }
            let providerStateLookup = foundLookup[command.identification.providerId];
            if (!providerStateLookup) {
                providerStateLookup = { total: 0 };
                foundLookup[command.identification.providerId] = providerStateLookup;
            }
            providerStateLookup.total = ++providerStateLookup.total;
            if (providerStateLookup.total > limitData.maxResults) {
                return { maxLimitHit: true };
            }
            const resultTypeName = command.result.type.name;
            providerStateLookup[resultTypeName] = providerStateLookup[resultTypeName] ? ++providerStateLookup[resultTypeName] : 1;
            if (providerStateLookup[resultTypeName] > limitData.maxResultsPerType) {
                return { maxLimitPerTypeHit: true };
            }
        }
        cleanTracking(queryId) {
            delete this.limitsLookup[queryId];
            delete this.limitsData[queryId];
        }
    }

    class ClientQuery {
        constructor(controller, logger, masterQueryId) {
            this.controller = controller;
            this.logger = logger;
            this.masterQueryId = masterQueryId;
        }
        exposeFacade() {
            const providerQueryFacade = {
                cancel: this.cancel.bind(this),
                onResults: this.onResults.bind(this),
                onCompleted: this.onCompleted.bind(this),
                onError: this.onError.bind(this)
            };
            return Object.freeze(providerQueryFacade);
        }
        cancel() {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = nanoid(10);
                this.logger.info(`[${commandId}] received a valid query cancel request, forwarding to the controller.`);
                yield this.controller.cancelQuery(this.masterQueryId, commandId);
                this.logger.info(`[${commandId}] the cancel request was completed.`);
            });
        }
        onResults(callback) {
            if (typeof callback !== "function") {
                throw new Error("onQuery requires a callback of type function");
            }
            const commandId = nanoid(10);
            this.logger.info(`[${commandId}] received a valid query onResults request, forwarding to the controller.`);
            const unsubscribe = this.controller.processClientOnResults({ callback, masterQueryId: this.masterQueryId, commandId });
            this.logger.info(`[${commandId}] the onResults request was completed.`);
            return unsubscribe;
        }
        onCompleted(callback) {
            if (typeof callback !== "function") {
                throw new Error("onQuery requires a callback of type function");
            }
            const commandId = nanoid(10);
            this.logger.info(`[${commandId}] received a valid query onCompleted request, forwarding to the controller.`);
            const unsubscribe = this.controller.processClientOnCompleted({ callback, masterQueryId: this.masterQueryId, commandId });
            this.logger.info(`[${commandId}] the onCompleted request was completed.`);
            return unsubscribe;
        }
        onError(callback) {
            if (typeof callback !== "function") {
                throw new Error("onQuery requires a callback of type function");
            }
            const commandId = nanoid(10);
            this.logger.info(`[${commandId}] received a valid query onError request, forwarding to the controller.`);
            const unsubscribe = this.controller.processClientOnError({ callback, masterQueryId: this.masterQueryId, commandId });
            this.logger.info(`[${commandId}] the onError request was completed.`);
            return unsubscribe;
        }
    }

    class ProviderModel {
        constructor(myData, controller, logger) {
            this.myData = myData;
            this.controller = controller;
            this.logger = logger;
        }
        get id() {
            return this.myData.id;
        }
        get name() {
            return this.myData.name;
        }
        get appName() {
            return this.myData.appName;
        }
        get types() {
            return this.myData.types;
        }
        get myProviderData() {
            return Object.assign({}, this.myData);
        }
        exposeFacade() {
            const providerFacade = {
                interopId: this.myData.interopId,
                id: this.id,
                name: this.name,
                appName: this.appName,
                types: this.types,
                onQuery: this.onQuery.bind(this),
                onQueryCancel: this.onQueryCancel.bind(this),
                unregister: this.unregister.bind(this)
            };
            return Object.freeze(providerFacade);
        }
        onQuery(callback) {
            if (typeof callback !== "function") {
                throw new Error("onQuery requires a callback of type function");
            }
            const commandId = nanoid(10);
            this.logger.info(`[${commandId}] received a valid onQuery request, forwarding to the controller.`);
            const unsubscribe = this.controller.processProviderOnQuery({ callback, id: this.id, commandId });
            this.logger.info(`[${commandId}] the onQuery request was completed.`);
            return unsubscribe;
        }
        onQueryCancel(callback) {
            if (typeof callback !== "function") {
                throw new Error("onQuery requires a callback of type function");
            }
            const commandId = nanoid(10);
            this.logger.info(`[${commandId}] received a valid onQueryCancel request, forwarding to the controller.`);
            const unsubscribe = this.controller.processProviderOnQueryCancel({ callback, id: this.id, commandId });
            this.logger.info(`[${commandId}] the onQueryCancel request was completed.`);
            return unsubscribe;
        }
        unregister() {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = nanoid(10);
                this.logger.info(`[${commandId}] received a valid unregister request, forwarding to the controller.`);
                yield this.controller.processProviderUnregister({ id: this.id, commandId });
                this.logger.info(`[${commandId}] the unregister request was completed.`);
            });
        }
    }

    class ProviderQueryModel {
        constructor(myData, controller, logger, identification) {
            this.myData = myData;
            this.controller = controller;
            this.logger = logger;
            this.identification = identification;
        }
        get id() {
            return this.identification.queryId;
        }
        get search() {
            return this.myData.search;
        }
        get providers() {
            return this.myData.providers;
        }
        get types() {
            return this.myData.types;
        }
        get providerLimits() {
            return this.myData.providerLimits;
        }
        get myQueryData() {
            return Object.assign({}, this.myData);
        }
        exposeFacade() {
            const providerQueryFacade = {
                id: this.id,
                search: this.search,
                providers: this.providers,
                types: this.types,
                providerLimits: this.providerLimits,
                sendResult: this.sendResult.bind(this),
                error: this.error.bind(this),
                done: this.done.bind(this)
            };
            return Object.freeze(providerQueryFacade);
        }
        sendResult(result) {
            queryResultDecoder.runWithException(result);
            const commandId = nanoid(10);
            this.logger.trace(`[${commandId}] Received a valid result, forwarding to the controller`);
            return this.controller.processProviderQueryResult({ identification: this.identification, result, commandId });
        }
        error(error) {
            const commandId = nanoid(10);
            nonEmptyStringDecoder.runWithException(error);
            this.logger.trace(`[${commandId}] Received a valid error, forwarding to the controller`);
            this.controller.processProviderQueryError({ identification: this.identification, error, commandId }).catch((error) => this.logger.warn(`Error processing the error signal for this provider: ${this.id}, error: ${extractErrorMsg(error)}`));
        }
        done() {
            const commandId = nanoid(10);
            this.logger.trace(`[${commandId}] Received a valid done, forwarding to the controller`);
            this.controller.processProviderQueryDone({ identification: this.identification, commandId }).catch((error) => this.logger.warn(`Error processing the done signal for this provider: ${this.identification.providerId}, error: ${extractErrorMsg(error)}`));
        }
    }

    class QueryResultsPublisher {
        constructor(sequelizer, glueController, logger, clientInstanceId, queryId, isLegacy) {
            this.sequelizer = sequelizer;
            this.glueController = glueController;
            this.logger = logger;
            this.clientInstanceId = clientInstanceId;
            this.queryId = queryId;
            this.isLegacy = isLegacy;
            this.queues = {};
        }
        checkProviderSuspended(providerId) {
            return this.queues[providerId] ? !!this.queues[providerId].suspended : false;
        }
        syncSuspendProvider(providerId, commandId) {
            const providerQueue = this.queues[providerId];
            if (!providerQueue) {
                this.logger.warn(`[${commandId}] Cannot suspend provider: ${providerId}, because there is no provider queue. This happens when the provider queue was already cancelled or completed`);
                return;
            }
            providerQueue.suspended = true;
        }
        configureProviders(providers) {
            providers.forEach((provider) => {
                this.queues[provider.myProviderData.id] = {
                    providerData: provider,
                    pendingResults: []
                };
            });
        }
        queueResult(command) {
            const { commandId, identification } = command;
            this.logger.trace(`[${commandId}] Queuing a new result from provider: ${identification.providerId}`);
            const providerQueue = this.queues[identification.providerId];
            if (!providerQueue) {
                this.logger.warn(`[${commandId}] Cannot queue this result, because there is no provider queue. This happens when the provider queue was already cancelled or completed`);
                return;
            }
            const result = this.isLegacy ? this.translateLegacySearchItem(command.result) : command.result;
            providerQueue.pendingResults.push(result);
            clearTimeout(providerQueue.flushTimer);
            if (providerQueue.pendingResults.length === 10) {
                this.logger.trace(`[${commandId}] Reached the limit in the queue buffer, flushing to the client.`);
                this.flushProviderQueue(identification.providerId, commandId);
                return;
            }
            this.logger.trace(`[${commandId}] The limit in the queue buffer is not reached yet, setting a flush timer.`);
            providerQueue.flushTimer = setTimeout(() => {
                this.logger.trace(`[${commandId}] Reached the time limit in the queue buffer, flushing to the client.`);
                this.flushProviderQueue(identification.providerId, commandId);
            }, FLUSH_TIMEOUT_MS);
        }
        cancel(commandId) {
            this.logger.trace(`[${commandId}] Cancelling queue ${this.queryId}.`);
            Object.values(this.queues).forEach((queue) => clearTimeout(queue.flushTimer));
            this.queues = {};
            this.logger.trace(`[${commandId}] Queue ${this.queryId} publisher cancelled.`);
        }
        markProviderDone(providerId, commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.trace(`[${commandId}] Marking provider ${providerId} as done.`);
                const providerQueue = this.queues[providerId];
                if (!providerQueue) {
                    this.logger.info(`[${commandId}] Cannot mark this queue as done, because there is no provider queue. This happens when the provider queue was already cancelled, completed or the provider sent an error`);
                    return;
                }
                clearTimeout(providerQueue.flushTimer);
                yield this.flushProviderQueue(providerId, commandId);
                delete this.queues[providerId];
                this.logger.trace(`[${commandId}] Provider ${providerId} marked as done.`);
            });
        }
        markProviderError(command) {
            const providerQueue = this.queues[command.identification.providerId];
            if (!providerQueue) {
                this.logger.warn(`[${command.commandId}] Cannot mark this provider as errored, because there is no provider queue. This happens when the provider queue was already cancelled, completed or the provider sent and error`);
                return;
            }
            this.glueController.sendClientErrorMessage(command.error, this.clientInstanceId, this.queryId, providerQueue.providerData.myProviderData)
                .catch((error) => this.logger.warn(`[${command.commandId}] The client errored when handling error message for query: ${this.queryId} -> ${extractErrorMsg(error)}`));
        }
        cleanPublisher(commandId) {
            Object.values(this.queues).forEach((queue) => clearTimeout(queue.flushTimer));
            this.queues = {};
            this.glueController.sendClientQueueCompleted(this.clientInstanceId, this.queryId)
                .catch((error) => this.logger.warn(`[${commandId}] The client errored when handling search end message for query: ${this.queryId} -> ${extractErrorMsg(error)}`));
        }
        flushProviderQueue(providerId, commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.sequelizer.enqueue(() => __awaiter(this, void 0, void 0, function* () {
                    const providerQueue = this.queues[providerId];
                    if (!providerQueue) {
                        this.logger.warn(`[${commandId}] Cannot flush this queue, because there is no provider queue. This happens when the provider queue was already cancelled, completed or the provider sent and error`);
                        return;
                    }
                    if (!providerQueue.pendingResults.length) {
                        this.logger.info(`[${commandId}] This provider does not have any pending results to flush.`);
                        return;
                    }
                    const resultBatch = {
                        results: providerQueue.pendingResults,
                        provider: providerQueue.providerData.myProviderData
                    };
                    providerQueue.pendingResults = [];
                    try {
                        yield this.glueController.sendClientResultsBatch(resultBatch, this.clientInstanceId, this.queryId);
                    }
                    catch (error) {
                        this.logger.warn(`[${commandId}] The client errored when handling search results for query: ${this.queryId} -> ${extractErrorMsg(error)}`);
                    }
                }));
            });
        }
        translateLegacySearchItem(searchResult) {
            return {
                type: searchResult.type.name,
                category: searchResult.type.displayName,
                id: searchResult.id,
                displayName: searchResult.displayName,
                description: searchResult.description,
                iconURL: searchResult.iconURL,
                action: searchResult.action
            };
        }
    }

    class ModelFactory {
        constructor(glueController, glue, flushSequelizer) {
            this.glueController = glueController;
            this.glue = glue;
            this.flushSequelizer = flushSequelizer;
        }
        buildProviderModel(providerData, controller) {
            return new ProviderModel(providerData, controller, this.glue.logger.subLogger(`search.provider.model.${providerData.name}`));
        }
        buildProviderQueryModel(queryConfig, identification, controller) {
            return new ProviderQueryModel(queryConfig, controller, this.glue.logger.subLogger(`search.provider.${identification.providerId}.query.${identification.queryId}`), identification);
        }
        buildPublisher(clientInstanceId, queryId, isLegacy) {
            return new QueryResultsPublisher(this.flushSequelizer, this.glueController, this.glue.logger.subLogger(`search.results.publisher.${queryId}`), clientInstanceId, queryId, isLegacy);
        }
        buildClientQueryModel(masterQueryId, controller) {
            return new ClientQuery(controller, this.glue.logger.subLogger(`search.provider.model.${masterQueryId}`), masterQueryId);
        }
    }

    class IoC {
        constructor(glue, config) {
            this.glue = glue;
            this.config = config;
        }
        initiate() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.clientController.start();
            });
        }
        get glueController() {
            if (!this._glueController) {
                this._glueController = new GlueController(this.glue);
            }
            return this._glueController;
        }
        get main() {
            if (!this._mainController) {
                this._mainController = new MainController(this.glue.logger.subLogger("search.main.controller"), this.glueController, this.clientController, this.providerController);
            }
            return this._mainController;
        }
        get clientController() {
            if (!this._clientController) {
                this._clientController = new ClientController(this.glue.logger.subLogger("search.client.controller"), this.glueController, this.modelFactory);
            }
            return this._clientController;
        }
        get providerController() {
            if (!this._providerController) {
                this._providerController = new ProviderController(this.glue.logger.subLogger("search.provider.controller"), this.glueController, this.sequelizer, this.limitsTracker, this.modelFactory);
            }
            return this._providerController;
        }
        get facade() {
            if (!this._facade) {
                this._facade = new SearchFacade(this.main);
            }
            return this._facade;
        }
        get sequelizer() {
            if (!this._asyncSequelizer) {
                this._asyncSequelizer = new AsyncSequelizer(SEQUELIZER_INTERVAL_MS);
            }
            return this._asyncSequelizer;
        }
        get flushSequelizer() {
            if (!this._flushSequelizer) {
                this._flushSequelizer = new AsyncSequelizer(FLUSH_SEQUELIZER_INTERVAL_MS);
            }
            return this._flushSequelizer;
        }
        get limitsTracker() {
            if (!this._limitsTracker) {
                this._limitsTracker = new LimitsTracker();
            }
            return this._limitsTracker;
        }
        get modelFactory() {
            if (!this._modelFactory) {
                this._modelFactory = new ModelFactory(this.glueController, this.glue, this.flushSequelizer);
            }
            return this._modelFactory;
        }
    }

    const factoryFunction = (glue, config) => __awaiter(void 0, void 0, void 0, function* () {
        const ioc = new IoC(glue, config);
        yield ioc.initiate();
        glue.search = ioc.facade.exposeApi();
    });
    if (typeof window !== "undefined") {
        window.GlueSearch = factoryFunction;
    }

    return factoryFunction;

}));
//# sourceMappingURL=search-api.umd.js.map
