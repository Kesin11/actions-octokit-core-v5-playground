(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/universal-user-agent/dist-node/index.js
  var require_dist_node = __commonJS({
    "node_modules/universal-user-agent/dist-node/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function getUserAgent3() {
        if (typeof navigator === "object" && "userAgent" in navigator) {
          return navigator.userAgent;
        }
        if (typeof process === "object" && "version" in process) {
          return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
        }
        return "<environment undetectable>";
      }
      exports.getUserAgent = getUserAgent3;
    }
  });

  // node_modules/before-after-hook/lib/register.js
  var require_register = __commonJS({
    "node_modules/before-after-hook/lib/register.js"(exports, module) {
      module.exports = register;
      function register(state, name, method, options) {
        if (typeof method !== "function") {
          throw new Error("method for before hook must be a function");
        }
        if (!options) {
          options = {};
        }
        if (Array.isArray(name)) {
          return name.reverse().reduce(function(callback, name2) {
            return register.bind(null, state, name2, callback, options);
          }, method)();
        }
        return Promise.resolve().then(function() {
          if (!state.registry[name]) {
            return method(options);
          }
          return state.registry[name].reduce(function(method2, registered) {
            return registered.hook.bind(null, method2, options);
          }, method)();
        });
      }
    }
  });

  // node_modules/before-after-hook/lib/add.js
  var require_add = __commonJS({
    "node_modules/before-after-hook/lib/add.js"(exports, module) {
      module.exports = addHook;
      function addHook(state, kind, name, hook2) {
        var orig = hook2;
        if (!state.registry[name]) {
          state.registry[name] = [];
        }
        if (kind === "before") {
          hook2 = function(method, options) {
            return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
          };
        }
        if (kind === "after") {
          hook2 = function(method, options) {
            var result;
            return Promise.resolve().then(method.bind(null, options)).then(function(result_) {
              result = result_;
              return orig(result, options);
            }).then(function() {
              return result;
            });
          };
        }
        if (kind === "error") {
          hook2 = function(method, options) {
            return Promise.resolve().then(method.bind(null, options)).catch(function(error) {
              return orig(error, options);
            });
          };
        }
        state.registry[name].push({
          hook: hook2,
          orig
        });
      }
    }
  });

  // node_modules/before-after-hook/lib/remove.js
  var require_remove = __commonJS({
    "node_modules/before-after-hook/lib/remove.js"(exports, module) {
      module.exports = removeHook;
      function removeHook(state, name, method) {
        if (!state.registry[name]) {
          return;
        }
        var index = state.registry[name].map(function(registered) {
          return registered.orig;
        }).indexOf(method);
        if (index === -1) {
          return;
        }
        state.registry[name].splice(index, 1);
      }
    }
  });

  // node_modules/before-after-hook/index.js
  var require_before_after_hook = __commonJS({
    "node_modules/before-after-hook/index.js"(exports, module) {
      var register = require_register();
      var addHook = require_add();
      var removeHook = require_remove();
      var bind = Function.bind;
      var bindable = bind.bind(bind);
      function bindApi(hook2, state, name) {
        var removeHookRef = bindable(removeHook, null).apply(
          null,
          name ? [state, name] : [state]
        );
        hook2.api = { remove: removeHookRef };
        hook2.remove = removeHookRef;
        ["before", "error", "after", "wrap"].forEach(function(kind) {
          var args = name ? [state, kind, name] : [state, kind];
          hook2[kind] = hook2.api[kind] = bindable(addHook, null).apply(null, args);
        });
      }
      function HookSingular() {
        var singularHookName = "h";
        var singularHookState = {
          registry: {}
        };
        var singularHook = register.bind(null, singularHookState, singularHookName);
        bindApi(singularHook, singularHookState, singularHookName);
        return singularHook;
      }
      function HookCollection() {
        var state = {
          registry: {}
        };
        var hook2 = register.bind(null, state);
        bindApi(hook2, state);
        return hook2;
      }
      var collectionHookDeprecationMessageDisplayed = false;
      function Hook() {
        if (!collectionHookDeprecationMessageDisplayed) {
          console.warn(
            '[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'
          );
          collectionHookDeprecationMessageDisplayed = true;
        }
        return HookCollection();
      }
      Hook.Singular = HookSingular.bind();
      Hook.Collection = HookCollection.bind();
      module.exports = Hook;
      module.exports.Hook = Hook;
      module.exports.Singular = Hook.Singular;
      module.exports.Collection = Hook.Collection;
    }
  });

  // node_modules/is-plain-object/dist/is-plain-object.mjs
  function isObject(o) {
    return Object.prototype.toString.call(o) === "[object Object]";
  }
  function isPlainObject(o) {
    var ctor, prot;
    if (isObject(o) === false)
      return false;
    ctor = o.constructor;
    if (ctor === void 0)
      return true;
    prot = ctor.prototype;
    if (isObject(prot) === false)
      return false;
    if (prot.hasOwnProperty("isPrototypeOf") === false) {
      return false;
    }
    return true;
  }
  var init_is_plain_object = __esm({
    "node_modules/is-plain-object/dist/is-plain-object.mjs"() {
    }
  });

  // node_modules/@octokit/endpoint/dist-web/index.js
  function lowercaseKeys(object) {
    if (!object) {
      return {};
    }
    return Object.keys(object).reduce((newObj, key) => {
      newObj[key.toLowerCase()] = object[key];
      return newObj;
    }, {});
  }
  function mergeDeep(defaults, options) {
    const result = Object.assign({}, defaults);
    Object.keys(options).forEach((key) => {
      if (isPlainObject(options[key])) {
        if (!(key in defaults))
          Object.assign(result, { [key]: options[key] });
        else
          result[key] = mergeDeep(defaults[key], options[key]);
      } else {
        Object.assign(result, { [key]: options[key] });
      }
    });
    return result;
  }
  function removeUndefinedProperties(obj) {
    for (const key in obj) {
      if (obj[key] === void 0) {
        delete obj[key];
      }
    }
    return obj;
  }
  function merge(defaults, route, options) {
    if (typeof route === "string") {
      let [method, url] = route.split(" ");
      options = Object.assign(url ? { method, url } : { url: method }, options);
    } else {
      options = Object.assign({}, route);
    }
    options.headers = lowercaseKeys(options.headers);
    removeUndefinedProperties(options);
    removeUndefinedProperties(options.headers);
    const mergedOptions = mergeDeep(defaults || {}, options);
    if (options.url === "/graphql") {
      if (defaults && defaults.mediaType.previews?.length) {
        mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(
          (preview) => !mergedOptions.mediaType.previews.includes(preview)
        ).concat(mergedOptions.mediaType.previews);
      }
      mergedOptions.mediaType.previews = (mergedOptions.mediaType.previews || []).map((preview) => preview.replace(/-preview/, ""));
    }
    return mergedOptions;
  }
  function addQueryParameters(url, parameters) {
    const separator = /\?/.test(url) ? "&" : "?";
    const names = Object.keys(parameters);
    if (names.length === 0) {
      return url;
    }
    return url + separator + names.map((name) => {
      if (name === "q") {
        return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
      }
      return `${name}=${encodeURIComponent(parameters[name])}`;
    }).join("&");
  }
  function removeNonChars(variableName) {
    return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
  }
  function extractUrlVariableNames(url) {
    const matches = url.match(urlVariableRegex);
    if (!matches) {
      return [];
    }
    return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
  }
  function omit(object, keysToOmit) {
    return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  }
  function encodeReserved(str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
      }
      return part;
    }).join("");
  }
  function encodeUnreserved(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  function encodeValue(operator, value, key) {
    value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
    if (key) {
      return encodeUnreserved(key) + "=" + value;
    } else {
      return value;
    }
  }
  function isDefined(value) {
    return value !== void 0 && value !== null;
  }
  function isKeyOperator(operator) {
    return operator === ";" || operator === "&" || operator === "?";
  }
  function getValues(context, operator, key, modifier) {
    var value = context[key], result = [];
    if (isDefined(value) && value !== "") {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        value = value.toString();
        if (modifier && modifier !== "*") {
          value = value.substring(0, parseInt(modifier, 10));
        }
        result.push(
          encodeValue(operator, value, isKeyOperator(operator) ? key : "")
        );
      } else {
        if (modifier === "*") {
          if (Array.isArray(value)) {
            value.filter(isDefined).forEach(function(value2) {
              result.push(
                encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
              );
            });
          } else {
            Object.keys(value).forEach(function(k) {
              if (isDefined(value[k])) {
                result.push(encodeValue(operator, value[k], k));
              }
            });
          }
        } else {
          const tmp = [];
          if (Array.isArray(value)) {
            value.filter(isDefined).forEach(function(value2) {
              tmp.push(encodeValue(operator, value2));
            });
          } else {
            Object.keys(value).forEach(function(k) {
              if (isDefined(value[k])) {
                tmp.push(encodeUnreserved(k));
                tmp.push(encodeValue(operator, value[k].toString()));
              }
            });
          }
          if (isKeyOperator(operator)) {
            result.push(encodeUnreserved(key) + "=" + tmp.join(","));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(","));
          }
        }
      }
    } else {
      if (operator === ";") {
        if (isDefined(value)) {
          result.push(encodeUnreserved(key));
        }
      } else if (value === "" && (operator === "&" || operator === "?")) {
        result.push(encodeUnreserved(key) + "=");
      } else if (value === "") {
        result.push("");
      }
    }
    return result;
  }
  function parseUrl(template) {
    return {
      expand: expand.bind(null, template)
    };
  }
  function expand(template, context) {
    var operators = ["+", "#", ".", "/", ";", "?", "&"];
    return template.replace(
      /\{([^\{\}]+)\}|([^\{\}]+)/g,
      function(_, expression, literal) {
        if (expression) {
          let operator = "";
          const values = [];
          if (operators.indexOf(expression.charAt(0)) !== -1) {
            operator = expression.charAt(0);
            expression = expression.substr(1);
          }
          expression.split(/,/g).forEach(function(variable) {
            var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
            values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
          });
          if (operator && operator !== "+") {
            var separator = ",";
            if (operator === "?") {
              separator = "&";
            } else if (operator !== "#") {
              separator = operator;
            }
            return (values.length !== 0 ? operator : "") + values.join(separator);
          } else {
            return values.join(",");
          }
        } else {
          return encodeReserved(literal);
        }
      }
    );
  }
  function parse(options) {
    let method = options.method.toUpperCase();
    let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
    let headers = Object.assign({}, options.headers);
    let body;
    let parameters = omit(options, [
      "method",
      "baseUrl",
      "url",
      "headers",
      "request",
      "mediaType"
    ]);
    const urlVariableNames = extractUrlVariableNames(url);
    url = parseUrl(url).expand(parameters);
    if (!/^http/.test(url)) {
      url = options.baseUrl + url;
    }
    const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
    const remainingParameters = omit(parameters, omittedParameters);
    const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
    if (!isBinaryRequest) {
      if (options.mediaType.format) {
        headers.accept = headers.accept.split(/,/).map(
          (format) => format.replace(
            /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
            `application/vnd$1$2.${options.mediaType.format}`
          )
        ).join(",");
      }
      if (url.endsWith("/graphql")) {
        if (options.mediaType.previews?.length) {
          const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
          headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
            const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
            return `application/vnd.github.${preview}-preview${format}`;
          }).join(",");
        }
      }
    }
    if (["GET", "HEAD"].includes(method)) {
      url = addQueryParameters(url, remainingParameters);
    } else {
      if ("data" in remainingParameters) {
        body = remainingParameters.data;
      } else {
        if (Object.keys(remainingParameters).length) {
          body = remainingParameters;
        }
      }
    }
    if (!headers["content-type"] && typeof body !== "undefined") {
      headers["content-type"] = "application/json; charset=utf-8";
    }
    if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
      body = "";
    }
    return Object.assign(
      { method, url, headers },
      typeof body !== "undefined" ? { body } : null,
      options.request ? { request: options.request } : null
    );
  }
  function endpointWithDefaults(defaults, route, options) {
    return parse(merge(defaults, route, options));
  }
  function withDefaults(oldDefaults, newDefaults) {
    const DEFAULTS2 = merge(oldDefaults, newDefaults);
    const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
    return Object.assign(endpoint2, {
      DEFAULTS: DEFAULTS2,
      defaults: withDefaults.bind(null, DEFAULTS2),
      merge: merge.bind(null, DEFAULTS2),
      parse
    });
  }
  var import_universal_user_agent, VERSION, userAgent, DEFAULTS, urlVariableRegex, endpoint;
  var init_dist_web = __esm({
    "node_modules/@octokit/endpoint/dist-web/index.js"() {
      import_universal_user_agent = __toESM(require_dist_node());
      init_is_plain_object();
      VERSION = "9.0.0";
      userAgent = `octokit-endpoint.js/${VERSION} ${(0, import_universal_user_agent.getUserAgent)()}`;
      DEFAULTS = {
        method: "GET",
        baseUrl: "https://api.github.com",
        headers: {
          accept: "application/vnd.github.v3+json",
          "user-agent": userAgent
        },
        mediaType: {
          format: ""
        }
      };
      urlVariableRegex = /\{[^}]+\}/g;
      endpoint = withDefaults(null, DEFAULTS);
    }
  });

  // node_modules/deprecation/dist-web/index.js
  var Deprecation;
  var init_dist_web2 = __esm({
    "node_modules/deprecation/dist-web/index.js"() {
      Deprecation = class extends Error {
        constructor(message) {
          super(message);
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
          this.name = "Deprecation";
        }
      };
    }
  });

  // node_modules/wrappy/wrappy.js
  var require_wrappy = __commonJS({
    "node_modules/wrappy/wrappy.js"(exports, module) {
      module.exports = wrappy;
      function wrappy(fn, cb) {
        if (fn && cb)
          return wrappy(fn)(cb);
        if (typeof fn !== "function")
          throw new TypeError("need wrapper function");
        Object.keys(fn).forEach(function(k) {
          wrapper[k] = fn[k];
        });
        return wrapper;
        function wrapper() {
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
          }
          var ret = fn.apply(this, args);
          var cb2 = args[args.length - 1];
          if (typeof ret === "function" && ret !== cb2) {
            Object.keys(cb2).forEach(function(k) {
              ret[k] = cb2[k];
            });
          }
          return ret;
        }
      }
    }
  });

  // node_modules/once/once.js
  var require_once = __commonJS({
    "node_modules/once/once.js"(exports, module) {
      var wrappy = require_wrappy();
      module.exports = wrappy(once2);
      module.exports.strict = wrappy(onceStrict);
      once2.proto = once2(function() {
        Object.defineProperty(Function.prototype, "once", {
          value: function() {
            return once2(this);
          },
          configurable: true
        });
        Object.defineProperty(Function.prototype, "onceStrict", {
          value: function() {
            return onceStrict(this);
          },
          configurable: true
        });
      });
      function once2(fn) {
        var f = function() {
          if (f.called)
            return f.value;
          f.called = true;
          return f.value = fn.apply(this, arguments);
        };
        f.called = false;
        return f;
      }
      function onceStrict(fn) {
        var f = function() {
          if (f.called)
            throw new Error(f.onceError);
          f.called = true;
          return f.value = fn.apply(this, arguments);
        };
        var name = fn.name || "Function wrapped with `once`";
        f.onceError = name + " shouldn't be called more than once";
        f.called = false;
        return f;
      }
    }
  });

  // node_modules/@octokit/request-error/dist-web/index.js
  var import_once, logOnceCode, logOnceHeaders, RequestError;
  var init_dist_web3 = __esm({
    "node_modules/@octokit/request-error/dist-web/index.js"() {
      init_dist_web2();
      import_once = __toESM(require_once());
      logOnceCode = (0, import_once.default)((deprecation) => console.warn(deprecation));
      logOnceHeaders = (0, import_once.default)((deprecation) => console.warn(deprecation));
      RequestError = class extends Error {
        constructor(message, statusCode, options) {
          super(message);
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
          this.name = "HttpError";
          this.status = statusCode;
          let headers;
          if ("headers" in options && typeof options.headers !== "undefined") {
            headers = options.headers;
          }
          if ("response" in options) {
            this.response = options.response;
            headers = options.response.headers;
          }
          const requestCopy = Object.assign({}, options.request);
          if (options.request.headers.authorization) {
            requestCopy.headers = Object.assign({}, options.request.headers, {
              authorization: options.request.headers.authorization.replace(
                / .*$/,
                " [REDACTED]"
              )
            });
          }
          requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
          this.request = requestCopy;
          Object.defineProperty(this, "code", {
            get() {
              logOnceCode(
                new Deprecation(
                  "[@octokit/request-error] `error.code` is deprecated, use `error.status`."
                )
              );
              return statusCode;
            }
          });
          Object.defineProperty(this, "headers", {
            get() {
              logOnceHeaders(
                new Deprecation(
                  "[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."
                )
              );
              return headers || {};
            }
          });
        }
      };
    }
  });

  // node_modules/@octokit/request/dist-web/index.js
  var dist_web_exports = {};
  __export(dist_web_exports, {
    request: () => request
  });
  function getBufferResponse(response) {
    return response.arrayBuffer();
  }
  function fetchWrapper(requestOptions) {
    const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;
    const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
    if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
    let headers = {};
    let status;
    let url;
    let { fetch } = globalThis;
    if (requestOptions.request?.fetch) {
      fetch = requestOptions.request.fetch;
    }
    if (!fetch) {
      throw new Error(
        "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
      );
    }
    return fetch(requestOptions.url, {
      method: requestOptions.method,
      body: requestOptions.body,
      headers: requestOptions.headers,
      signal: requestOptions.request?.signal,
      // duplex must be set if request.body is ReadableStream or Async Iterables.
      // See https://fetch.spec.whatwg.org/#dom-requestinit-duplex.
      ...requestOptions.body && { duplex: "half" }
    }).then(async (response) => {
      url = response.url;
      status = response.status;
      for (const keyAndValue of response.headers) {
        headers[keyAndValue[0]] = keyAndValue[1];
      }
      if ("deprecation" in headers) {
        const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
        const deprecationLink = matches && matches.pop();
        log.warn(
          `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
        );
      }
      if (status === 204 || status === 205) {
        return;
      }
      if (requestOptions.method === "HEAD") {
        if (status < 400) {
          return;
        }
        throw new RequestError(response.statusText, status, {
          response: {
            url,
            status,
            headers,
            data: void 0
          },
          request: requestOptions
        });
      }
      if (status === 304) {
        throw new RequestError("Not modified", status, {
          response: {
            url,
            status,
            headers,
            data: await getResponseData(response)
          },
          request: requestOptions
        });
      }
      if (status >= 400) {
        const data = await getResponseData(response);
        const error = new RequestError(toErrorMessage(data), status, {
          response: {
            url,
            status,
            headers,
            data
          },
          request: requestOptions
        });
        throw error;
      }
      return parseSuccessResponseBody ? await getResponseData(response) : response.body;
    }).then((data) => {
      return {
        status,
        url,
        headers,
        data
      };
    }).catch((error) => {
      if (error instanceof RequestError)
        throw error;
      else if (error.name === "AbortError")
        throw error;
      throw new RequestError(error.message, 500, {
        request: requestOptions
      });
    });
  }
  async function getResponseData(response) {
    const contentType = response.headers.get("content-type");
    if (/application\/json/.test(contentType)) {
      return response.json();
    }
    if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
      return response.text();
    }
    return getBufferResponse(response);
  }
  function toErrorMessage(data) {
    if (typeof data === "string")
      return data;
    if ("message" in data) {
      if (Array.isArray(data.errors)) {
        return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
      }
      return data.message;
    }
    return `Unknown error: ${JSON.stringify(data)}`;
  }
  function withDefaults2(oldEndpoint, newDefaults) {
    const endpoint2 = oldEndpoint.defaults(newDefaults);
    const newApi = function(route, parameters) {
      const endpointOptions = endpoint2.merge(route, parameters);
      if (!endpointOptions.request || !endpointOptions.request.hook) {
        return fetchWrapper(endpoint2.parse(endpointOptions));
      }
      const request2 = (route2, parameters2) => {
        return fetchWrapper(
          endpoint2.parse(endpoint2.merge(route2, parameters2))
        );
      };
      Object.assign(request2, {
        endpoint: endpoint2,
        defaults: withDefaults2.bind(null, endpoint2)
      });
      return endpointOptions.request.hook(request2, endpointOptions);
    };
    return Object.assign(newApi, {
      endpoint: endpoint2,
      defaults: withDefaults2.bind(null, endpoint2)
    });
  }
  var import_universal_user_agent2, VERSION2, request;
  var init_dist_web4 = __esm({
    "node_modules/@octokit/request/dist-web/index.js"() {
      init_dist_web();
      import_universal_user_agent2 = __toESM(require_dist_node());
      init_is_plain_object();
      init_dist_web3();
      VERSION2 = "8.1.1";
      request = withDefaults2(endpoint, {
        headers: {
          "user-agent": `octokit-request.js/${VERSION2} ${(0, import_universal_user_agent2.getUserAgent)()}`
        }
      });
    }
  });

  // node_modules/@octokit/graphql/dist-node/index.js
  var require_dist_node2 = __commonJS({
    "node_modules/@octokit/graphql/dist-node/index.js"(exports, module) {
      "use strict";
      var __defProp2 = Object.defineProperty;
      var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames2 = Object.getOwnPropertyNames;
      var __hasOwnProp2 = Object.prototype.hasOwnProperty;
      var __export2 = (target, all) => {
        for (var name in all)
          __defProp2(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps2 = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames2(from))
            if (!__hasOwnProp2.call(to, key) && key !== except)
              __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
      var dist_src_exports = {};
      __export2(dist_src_exports, {
        GraphqlResponseError: () => GraphqlResponseError,
        graphql: () => graphql2,
        withCustomRequest: () => withCustomRequest
      });
      module.exports = __toCommonJS2(dist_src_exports);
      var import_request3 = (init_dist_web4(), __toCommonJS(dist_web_exports));
      var import_universal_user_agent3 = require_dist_node();
      var VERSION3 = "7.0.1";
      var import_request2 = (init_dist_web4(), __toCommonJS(dist_web_exports));
      var import_request = (init_dist_web4(), __toCommonJS(dist_web_exports));
      function _buildMessageForResponseErrors(data) {
        return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
      }
      var GraphqlResponseError = class extends Error {
        constructor(request2, headers, response) {
          super(_buildMessageForResponseErrors(response));
          this.request = request2;
          this.headers = headers;
          this.response = response;
          this.name = "GraphqlResponseError";
          this.errors = response.errors;
          this.data = response.data;
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
        }
      };
      var NON_VARIABLE_OPTIONS = [
        "method",
        "baseUrl",
        "url",
        "headers",
        "request",
        "query",
        "mediaType"
      ];
      var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
      var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
      function graphql(request2, query, options) {
        if (options) {
          if (typeof query === "string" && "query" in options) {
            return Promise.reject(
              new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
            );
          }
          for (const key in options) {
            if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
              continue;
            return Promise.reject(
              new Error(
                `[@octokit/graphql] "${key}" cannot be used as variable name`
              )
            );
          }
        }
        const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
        const requestOptions = Object.keys(
          parsedOptions
        ).reduce((result, key) => {
          if (NON_VARIABLE_OPTIONS.includes(key)) {
            result[key] = parsedOptions[key];
            return result;
          }
          if (!result.variables) {
            result.variables = {};
          }
          result.variables[key] = parsedOptions[key];
          return result;
        }, {});
        const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
        if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
          requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
        }
        return request2(requestOptions).then((response) => {
          if (response.data.errors) {
            const headers = {};
            for (const key of Object.keys(response.headers)) {
              headers[key] = response.headers[key];
            }
            throw new GraphqlResponseError(
              requestOptions,
              headers,
              response.data
            );
          }
          return response.data.data;
        });
      }
      function withDefaults3(request2, newDefaults) {
        const newRequest = request2.defaults(newDefaults);
        const newApi = (query, options) => {
          return graphql(newRequest, query, options);
        };
        return Object.assign(newApi, {
          defaults: withDefaults3.bind(null, newRequest),
          endpoint: newRequest.endpoint
        });
      }
      var graphql2 = withDefaults3(import_request3.request, {
        headers: {
          "user-agent": `octokit-graphql.js/${VERSION3} ${(0, import_universal_user_agent3.getUserAgent)()}`
        },
        method: "POST",
        url: "/graphql"
      });
      function withCustomRequest(customRequest) {
        return withDefaults3(customRequest, {
          method: "POST",
          url: "/graphql"
        });
      }
    }
  });

  // node_modules/@octokit/auth-token/dist-web/index.js
  var dist_web_exports2 = {};
  __export(dist_web_exports2, {
    createTokenAuth: () => createTokenAuth
  });
  async function auth(token) {
    const isApp = token.split(/\./).length === 3;
    const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
    const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
    const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
    return {
      type: "token",
      token,
      tokenType
    };
  }
  function withAuthorizationPrefix(token) {
    if (token.split(/\./).length === 3) {
      return `bearer ${token}`;
    }
    return `token ${token}`;
  }
  async function hook(token, request2, route, parameters) {
    const endpoint2 = request2.endpoint.merge(
      route,
      parameters
    );
    endpoint2.headers.authorization = withAuthorizationPrefix(token);
    return request2(endpoint2);
  }
  var REGEX_IS_INSTALLATION_LEGACY, REGEX_IS_INSTALLATION, REGEX_IS_USER_TO_SERVER, createTokenAuth;
  var init_dist_web5 = __esm({
    "node_modules/@octokit/auth-token/dist-web/index.js"() {
      REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
      REGEX_IS_INSTALLATION = /^ghs_/;
      REGEX_IS_USER_TO_SERVER = /^ghu_/;
      createTokenAuth = function createTokenAuth2(token) {
        if (!token) {
          throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
        }
        if (typeof token !== "string") {
          throw new Error(
            "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
          );
        }
        token = token.replace(/^(token|bearer) +/i, "");
        return Object.assign(auth.bind(null, token), {
          hook: hook.bind(null, token)
        });
      };
    }
  });

  // node_modules/@octokit/core/dist-node/index.js
  var require_dist_node3 = __commonJS({
    "node_modules/@octokit/core/dist-node/index.js"(exports, module) {
      "use strict";
      var __defProp2 = Object.defineProperty;
      var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames2 = Object.getOwnPropertyNames;
      var __hasOwnProp2 = Object.prototype.hasOwnProperty;
      var __export2 = (target, all) => {
        for (var name in all)
          __defProp2(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps2 = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames2(from))
            if (!__hasOwnProp2.call(to, key) && key !== except)
              __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
      var dist_src_exports = {};
      __export2(dist_src_exports, {
        Octokit: () => Octokit2
      });
      module.exports = __toCommonJS2(dist_src_exports);
      var import_universal_user_agent3 = require_dist_node();
      var import_before_after_hook = require_before_after_hook();
      var import_request = (init_dist_web4(), __toCommonJS(dist_web_exports));
      var import_graphql = require_dist_node2();
      var import_auth_token = (init_dist_web5(), __toCommonJS(dist_web_exports2));
      var VERSION3 = "5.0.0";
      var Octokit2 = class {
        static {
          this.VERSION = VERSION3;
        }
        static defaults(defaults) {
          const OctokitWithDefaults = class extends this {
            constructor(...args) {
              const options = args[0] || {};
              if (typeof defaults === "function") {
                super(defaults(options));
                return;
              }
              super(
                Object.assign(
                  {},
                  defaults,
                  options,
                  options.userAgent && defaults.userAgent ? {
                    userAgent: `${options.userAgent} ${defaults.userAgent}`
                  } : null
                )
              );
            }
          };
          return OctokitWithDefaults;
        }
        static {
          this.plugins = [];
        }
        /**
         * Attach a plugin (or many) to your Octokit instance.
         *
         * @example
         * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
         */
        static plugin(...newPlugins) {
          const currentPlugins = this.plugins;
          const NewOctokit = class extends this {
            static {
              this.plugins = currentPlugins.concat(
                newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
              );
            }
          };
          return NewOctokit;
        }
        constructor(options = {}) {
          const hook2 = new import_before_after_hook.Collection();
          const requestDefaults = {
            baseUrl: import_request.request.endpoint.DEFAULTS.baseUrl,
            headers: {},
            request: Object.assign({}, options.request, {
              // @ts-ignore internal usage only, no need to type
              hook: hook2.bind(null, "request")
            }),
            mediaType: {
              previews: [],
              format: ""
            }
          };
          requestDefaults.headers["user-agent"] = [
            options.userAgent,
            `octokit-core.js/${VERSION3} ${(0, import_universal_user_agent3.getUserAgent)()}`
          ].filter(Boolean).join(" ");
          if (options.baseUrl) {
            requestDefaults.baseUrl = options.baseUrl;
          }
          if (options.previews) {
            requestDefaults.mediaType.previews = options.previews;
          }
          if (options.timeZone) {
            requestDefaults.headers["time-zone"] = options.timeZone;
          }
          this.request = import_request.request.defaults(requestDefaults);
          this.graphql = (0, import_graphql.withCustomRequest)(this.request).defaults(requestDefaults);
          this.log = Object.assign(
            {
              debug: () => {
              },
              info: () => {
              },
              warn: console.warn.bind(console),
              error: console.error.bind(console)
            },
            options.log
          );
          this.hook = hook2;
          if (!options.authStrategy) {
            if (!options.auth) {
              this.auth = async () => ({
                type: "unauthenticated"
              });
            } else {
              const auth2 = (0, import_auth_token.createTokenAuth)(options.auth);
              hook2.wrap("request", auth2.hook);
              this.auth = auth2;
            }
          } else {
            const { authStrategy, ...otherOptions } = options;
            const auth2 = authStrategy(
              Object.assign(
                {
                  request: this.request,
                  log: this.log,
                  // we pass the current octokit instance as well as its constructor options
                  // to allow for authentication strategies that return a new octokit instance
                  // that shares the same internal state as the current one. The original
                  // requirement for this was the "event-octokit" authentication strategy
                  // of https://github.com/probot/octokit-auth-probot.
                  octokit: this,
                  octokitOptions: otherOptions
                },
                options.auth
              )
            );
            hook2.wrap("request", auth2.hook);
            this.auth = auth2;
          }
          const classConstructor = this.constructor;
          classConstructor.plugins.forEach((plugin) => {
            Object.assign(this, plugin(this, options));
          });
        }
      };
    }
  });

  // index.js
  var { Octokit } = require_dist_node3();
  async function run() {
    const token = process.env.GITHUB_TOKEN;
    if (!token)
      throw new Error("GITHUB_TOKEN is undefined");
    const octokit = new Octokit({ auth: token });
    console.log("GET /user");
    const res = await octokit.request("GET /user");
    console.dir(res.data);
  }
  run();
})();
/*! Bundled license information:

is-plain-object/dist/is-plain-object.mjs:
  (*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)
*/
