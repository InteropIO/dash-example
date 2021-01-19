(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.web = global.web || {}, global.web.worker = {})));
}(this, (function (exports) { 'use strict';

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

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const serviceWorkerBroadcastChannelName = "glue42-core-worker";
    const platformPingTimeoutMS = 3000;
    const platformOpenTimeoutMS = 60000;

    /**
     * Wraps values in an `Ok` type.
     *
     * Example: `ok(5) // => {ok: true, result: 5}`
     */
    var ok = function (result) { return ({ ok: true, result: result }); };
    /**
     * Typeguard for `Ok`.
     */
    var isOk = function (r) { return r.ok === true; };
    /**
     * Wraps errors in an `Err` type.
     *
     * Example: `err('on fire') // => {ok: false, error: 'on fire'}`
     */
    var err = function (error) { return ({ ok: false, error: error }); };
    /**
     * Typeguard for `Err`.
     */
    var isErr = function (r) { return r.ok === false; };
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
     * Given an array of `Result`s, return the successful values.
     */
    var successes = function (results) {
        return results.reduce(function (acc, r) { return (r.ok === true ? acc.concat(r.result) : acc); }, []);
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


    Object.freeze({
    	ok: ok,
    	isOk: isOk,
    	err: err,
    	isErr: isErr,
    	asPromise: asPromise,
    	withDefault: withDefault,
    	withException: withException,
    	successes: successes,
    	map: map,
    	map2: map2,
    	mapError: mapError,
    	andThen: andThen
    });

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
    /** See `Decoder.boolean` */
    var boolean = Decoder.boolean;
    /** See `Decoder.anyJson` */
    var anyJson = Decoder.anyJson;
    /** See `Decoder.object` */
    var object = Decoder.object;
    /** See `Decoder.array` */
    var array = Decoder.array;
    /** See `Decoder.optional` */
    var optional = Decoder.optional;
    /** See `Decoder.fail` */
    var fail = Decoder.fail;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    const functionCheck = (input, propDescription) => {
        const providedType = typeof input;
        return providedType === "function" ?
            anyJson() :
            fail(`The provided argument as ${propDescription} should be of type function, provided: ${typeof providedType}`);
    };
    const glue42NotificationClickHandlerDecoder = object({
        action: nonEmptyStringDecoder,
        handler: anyJson().andThen((result) => functionCheck(result, "handler"))
    });
    const webWorkerConfigDecoder = object({
        platform: optional(object({
            url: nonEmptyStringDecoder,
            openIfMissing: optional(boolean())
        })),
        notifications: optional(object({
            defaultClick: optional(anyJson().andThen((result) => functionCheck(result, "defaultClick"))),
            actionClicks: optional(array(glue42NotificationClickHandlerDecoder))
        }))
    });

    var lib = {exports: {}};

    // Found this seed-based random generator somewhere
    // Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

    var seed = 1;

    /**
     * return a random number based on a seed
     * @param seed
     * @returns {number}
     */
    function getNextValue() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed/(233280.0);
    }

    function setSeed$1(_seed_) {
        seed = _seed_;
    }

    var randomFromSeed$1 = {
        nextValue: getNextValue,
        seed: setSeed$1
    };

    var randomFromSeed = randomFromSeed$1;

    var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    var alphabet$2;
    var previousSeed;

    var shuffled;

    function reset() {
        shuffled = false;
    }

    function setCharacters(_alphabet_) {
        if (!_alphabet_) {
            if (alphabet$2 !== ORIGINAL) {
                alphabet$2 = ORIGINAL;
                reset();
            }
            return;
        }

        if (_alphabet_ === alphabet$2) {
            return;
        }

        if (_alphabet_.length !== ORIGINAL.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
        }

        var unique = _alphabet_.split('').filter(function(item, ind, arr){
           return ind !== arr.lastIndexOf(item);
        });

        if (unique.length) {
            throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
        }

        alphabet$2 = _alphabet_;
        reset();
    }

    function characters(_alphabet_) {
        setCharacters(_alphabet_);
        return alphabet$2;
    }

    function setSeed(seed) {
        randomFromSeed.seed(seed);
        if (previousSeed !== seed) {
            reset();
            previousSeed = seed;
        }
    }

    function shuffle() {
        if (!alphabet$2) {
            setCharacters(ORIGINAL);
        }

        var sourceArray = alphabet$2.split('');
        var targetArray = [];
        var r = randomFromSeed.nextValue();
        var characterIndex;

        while (sourceArray.length > 0) {
            r = randomFromSeed.nextValue();
            characterIndex = Math.floor(r * sourceArray.length);
            targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
        }
        return targetArray.join('');
    }

    function getShuffled() {
        if (shuffled) {
            return shuffled;
        }
        shuffled = shuffle();
        return shuffled;
    }

    /**
     * lookup shuffled letter
     * @param index
     * @returns {string}
     */
    function lookup(index) {
        var alphabetShuffled = getShuffled();
        return alphabetShuffled[index];
    }

    function get () {
      return alphabet$2 || ORIGINAL;
    }

    var alphabet_1 = {
        get: get,
        characters: characters,
        seed: setSeed,
        lookup: lookup,
        shuffled: getShuffled
    };

    var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

    var randomByte;

    if (!crypto || !crypto.getRandomValues) {
        randomByte = function(size) {
            var bytes = [];
            for (var i = 0; i < size; i++) {
                bytes.push(Math.floor(Math.random() * 256));
            }
            return bytes;
        };
    } else {
        randomByte = function(size) {
            return crypto.getRandomValues(new Uint8Array(size));
        };
    }

    var randomByteBrowser = randomByte;

    // This file replaces `format.js` in bundlers like webpack or Rollup,
    // according to `browser` config in `package.json`.

    var format_browser = function (random, alphabet, size) {
      // We can’t use bytes bigger than the alphabet. To make bytes values closer
      // to the alphabet, we apply bitmask on them. We look for the closest
      // `2 ** x - 1` number, which will be bigger than alphabet size. If we have
      // 30 symbols in the alphabet, we will take 31 (00011111).
      // We do not use faster Math.clz32, because it is not available in browsers.
      var mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
      // Bitmask is not a perfect solution (in our example it will pass 31 bytes,
      // which is bigger than the alphabet). As a result, we will need more bytes,
      // than ID size, because we will refuse bytes bigger than the alphabet.

      // Every hardware random generator call is costly,
      // because we need to wait for entropy collection. This is why often it will
      // be faster to ask for few extra bytes in advance, to avoid additional calls.

      // Here we calculate how many random bytes should we call in advance.
      // It depends on ID length, mask / alphabet size and magic number 1.6
      // (which was selected according benchmarks).

      // -~f => Math.ceil(f) if n is float number
      // -~i => i + 1 if n is integer number
      var step = -~(1.6 * mask * size / alphabet.length);
      var id = '';

      while (true) {
        var bytes = random(step);
        // Compact alternative for `for (var i = 0; i < step; i++)`
        var i = step;
        while (i--) {
          // If random byte is bigger than alphabet even after bitmask,
          // we refuse it by `|| ''`.
          id += alphabet[bytes[i] & mask] || '';
          // More compact than `id.length + 1 === size`
          if (id.length === +size) return id
        }
      }
    };

    var alphabet$1 = alphabet_1;
    var random = randomByteBrowser;
    var format = format_browser;

    function generate$1(number) {
        var loopCounter = 0;
        var done;

        var str = '';

        while (!done) {
            str = str + format(random, alphabet$1.get(), 1);
            done = number < (Math.pow(16, loopCounter + 1 ) );
            loopCounter++;
        }
        return str;
    }

    var generate_1 = generate$1;

    var generate = generate_1;

    // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
    // This number should be updated every year or so to keep the generated id short.
    // To regenerate `new Date() - 0` and bump the version. Always bump the version!
    var REDUCE_TIME = 1567752802062;

    // don't change unless we change the algos or REDUCE_TIME
    // must be an integer and less than 16
    var version = 7;

    // Counter is used when shortid is called multiple times in one second.
    var counter;

    // Remember the last time shortid was called in case counter is needed.
    var previousSeconds;

    /**
     * Generate unique id
     * Returns string id
     */
    function build(clusterWorkerId) {
        var str = '';

        var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

        if (seconds === previousSeconds) {
            counter++;
        } else {
            counter = 0;
            previousSeconds = seconds;
        }

        str = str + generate(version);
        str = str + generate(clusterWorkerId);
        if (counter > 0) {
            str = str + generate(counter);
        }
        str = str + generate(seconds);
        return str;
    }

    var build_1 = build;

    var alphabet = alphabet_1;

    function isShortId(id) {
        if (!id || typeof id !== 'string' || id.length < 6 ) {
            return false;
        }

        var nonAlphabetic = new RegExp('[^' +
          alphabet.get().replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
        ']');
        return !nonAlphabetic.test(id);
    }

    var isValid = isShortId;

    (function (module) {

    var alphabet = alphabet_1;
    var build = build_1;
    var isValid$1 = isValid;

    // if you are using cluster or multiple servers use this to make each instance
    // has a unique value for worker
    // Note: I don't know if this is automatically set when using third
    // party cluster solutions such as pm2.
    var clusterWorkerId = 0;

    /**
     * Set the seed.
     * Highly recommended if you don't want people to try to figure out your id schema.
     * exposed as shortid.seed(int)
     * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
     */
    function seed(seedValue) {
        alphabet.seed(seedValue);
        return module.exports;
    }

    /**
     * Set the cluster worker or machine id
     * exposed as shortid.worker(int)
     * @param workerId worker must be positive integer.  Number less than 16 is recommended.
     * returns shortid module so it can be chained.
     */
    function worker(workerId) {
        clusterWorkerId = workerId;
        return module.exports;
    }

    /**
     *
     * sets new characters to use in the alphabet
     * returns the shuffled alphabet
     */
    function characters(newCharacters) {
        if (newCharacters !== undefined) {
            alphabet.characters(newCharacters);
        }

        return alphabet.shuffled();
    }

    /**
     * Generate unique id
     * Returns string id
     */
    function generate() {
      return build(clusterWorkerId);
    }

    // Export all other functions as properties of the generate function
    module.exports = generate;
    module.exports.generate = generate;
    module.exports.seed = seed;
    module.exports.worker = worker;
    module.exports.characters = characters;
    module.exports.isValid = isValid$1;
    }(lib));

    var shortid = lib.exports;

    const checkPlatformOpen = () => {
        const checkPromise = new Promise((resolve) => {
            const channel = new BroadcastChannel(serviceWorkerBroadcastChannelName);
            const existenceHandler = function (event) {
                const data = event.data;
                if (data.pong) {
                    channel.removeEventListener("message", existenceHandler);
                    resolve(true);
                }
            };
            channel.addEventListener("message", existenceHandler);
            channel.postMessage({ messageType: "ping" });
        });
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), platformPingTimeoutMS));
        return Promise.race([checkPromise, timeoutPromise]);
    };
    const validateConfig = (config = {}) => {
        const validated = webWorkerConfigDecoder.runWithException(config);
        return validated;
    };
    const raiseGlueNotification = (settings) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const options = Object.assign({}, settings, { title: undefined, clickInterop: undefined, actions: undefined });
        options.actions = (_a = settings.actions) === null || _a === void 0 ? void 0 : _a.map((action) => {
            return {
                action: action.action,
                title: action.title,
                icon: action.icon
            };
        });
        const glueData = {
            clickInterop: settings.clickInterop,
            actions: settings.actions,
            id: shortid.generate()
        };
        if (options.data) {
            options.data.glueData = glueData;
        }
        else {
            options.data = { glueData };
        }
        return self.registration.showNotification(settings.title, options);
    });
    const openCorePlatform = (url) => {
        return new Promise((resolve, reject) => {
            if (!url) {
                return reject("Cannot open the platform, because a url was not provided");
            }
            const channel = new BroadcastChannel(serviceWorkerBroadcastChannelName);
            const openHandler = function (event) {
                const data = event.data;
                if (data.platformStarted) {
                    channel.removeEventListener("message", openHandler);
                    resolve();
                }
            };
            channel.addEventListener("message", openHandler);
            self.clients.openWindow(url).catch(reject);
            setTimeout(() => reject(`Timed out waiting for the platform to open and send a ready signal: ${platformOpenTimeoutMS} MS`), platformOpenTimeoutMS);
        });
    };
    const setupCore = (config) => {
        const verifiedConfig = validateConfig(config);
        self.addEventListener("notificationclick", (event) => {
            let isPlatformOpen;
            const channel = new BroadcastChannel(serviceWorkerBroadcastChannelName);
            const executionPromise = checkPlatformOpen()
                .then((platformExists) => {
                var _a, _b, _c;
                isPlatformOpen = platformExists;
                const action = event.action;
                if (!action && ((_a = verifiedConfig.notifications) === null || _a === void 0 ? void 0 : _a.defaultClick)) {
                    return verifiedConfig.notifications.defaultClick(event, isPlatformOpen);
                }
                if (action && ((_c = (_b = verifiedConfig.notifications) === null || _b === void 0 ? void 0 : _b.actionClicks) === null || _c === void 0 ? void 0 : _c.some((actionDef) => actionDef.action === action))) {
                    const foundHandler = verifiedConfig.notifications.actionClicks.find((actionDef) => actionDef.action === action).handler;
                    return foundHandler(event, isPlatformOpen);
                }
            })
                .then(() => {
                var _a;
                if (!isPlatformOpen && ((_a = verifiedConfig.platform) === null || _a === void 0 ? void 0 : _a.openIfMissing)) {
                    return openCorePlatform(verifiedConfig.platform.url);
                }
            })
                .then(() => {
                const messageType = "notificationClick";
                const action = event.action;
                const glueData = event.notification.data.glueData;
                const definition = {
                    badge: event.notification.badge,
                    body: event.notification.body,
                    data: event.notification.data,
                    dir: event.notification.dir,
                    icon: event.notification.icon,
                    image: event.notification.image,
                    lang: event.notification.lang,
                    renotify: event.notification.renotify,
                    requireInteraction: event.notification.requireInteraction,
                    silent: event.notification.silent,
                    tag: event.notification.tag,
                    timestamp: event.notification.timestamp,
                    vibrate: event.notification.vibrate
                };
                channel.postMessage({ messageType, action, glueData, definition });
            })
                .then(() => {
                var _a, _b;
                (_b = (_a = event.notification.data) === null || _a === void 0 ? void 0 : _a.glueData) === null || _b === void 0 ? void 0 : _b.focusPlatformOnDefaultClick;
            })
                .catch((error) => {
                const stringError = typeof error === "string" ? error : JSON.stringify(error.message);
                channel.postMessage({ messageType: "notificationError", error: stringError });
            });
            event.waitUntil(executionPromise);
        });
    };

    if (typeof self !== "undefined") {
        self.GlueWebWorker = setupCore;
        self.openCorePlatform = openCorePlatform;
        self.raiseGlueNotification = raiseGlueNotification;
    }

    exports.default = setupCore;
    exports.openCorePlatform = openCorePlatform;
    exports.raiseGlueNotification = raiseGlueNotification;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=web.worker.umd.js.map
