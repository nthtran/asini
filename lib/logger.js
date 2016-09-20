"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _progressBar = require("./progressBar");

var _progressBar2 = _interopRequireDefault(_progressBar);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _pad = require("pad");

var _pad2 = _interopRequireDefault(_pad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cwd = process.cwd();

var DEFAULT_LOGLEVEL = "info";

var LEVELS = [["silly", "magenta"], ["verbose", "blue"], ["info", "white"], ["success", "green"], ["warn", "yellow"], ["error", "red"], ["silent"]];

var TYPE_TO_LEVEL = LEVELS.reduce(function (map, _ref, index) {
  var _ref2 = _slicedToArray(_ref, 1);

  var type = _ref2[0];
  return map[type] = index, map;
}, {});

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);

    this.setLogLevel();
    this.logs = [];
  }

  _createClass(Logger, [{
    key: "setLogLevel",
    value: function setLogLevel(type) {
      this.loglevel = TYPE_TO_LEVEL[type || DEFAULT_LOGLEVEL];
    }
  }, {
    key: "_log",
    value: function _log(type, style, level, message, error) {
      if (process.env.NODE_ENV !== "test") {
        this.logs.push({
          type: type,
          message: message,
          error: error
        });
      }

      if (level < this.loglevel) {
        return;
      }

      if (error) {
        message += "\n" + (error.stack || error);
      }

      if (style) {
        message = style(message);
      }

      _progressBar2.default.clear();
      this._emit(message);
      _progressBar2.default.restore();
    }
  }, {
    key: "_emit",
    value: function _emit(message) {
      if (process.env.NODE_ENV !== "test") {
        console.log(message);
      }
    }
  }, {
    key: "newLine",
    value: function newLine() {
      this._emit("");
    }
  }, {
    key: "logifyAsync",
    value: function logifyAsync(target, property, descriptor) {
      var message = target.name + "." + property;
      var method = descriptor.value;

      descriptor.value = function () {
        var args = [].slice.call(arguments);
        var callback = args.pop();
        var msg = logger._formatMethod(message, args);

        logger.silly(msg);

        // wrap final callback
        args.push(function (error, value) {
          if (error) {
            logger.error(msg);
          } else {
            logger.silly(msg + " => " + logger._formatValue(value));
          }

          callback(error, value);
        });

        method.apply(this, args);
      };
    }
  }, {
    key: "logifySync",
    value: function logifySync(target, property, descriptor) {
      var message = target.name + "." + property;
      var method = descriptor.value;

      descriptor.value = function () {
        var args = [].slice.call(arguments);
        var msg = logger._formatMethod(message, args);

        logger.silly(msg);

        try {
          var result = method.apply(this, args);
          logger.silly(msg + " => " + logger._formatValue(result));
          return result;
        } catch (error) {
          logger.error(msg, error);
          throw error;
        }
      };
    }
  }, {
    key: "_formatMethod",
    value: function _formatMethod(method, args) {
      return (0, _pad2.default)(method, 30, " ") + "(" + this._formatArguments(args) + ")";
    }
  }, {
    key: "_formatArguments",
    value: function _formatArguments(args) {
      return args.map(this._formatValue).join(", ");
    }
  }, {
    key: "_formatValue",
    value: function _formatValue(arg) {
      if (typeof arg === "function") {
        return "function " + arg.name + "() {...}";
      }

      return (JSON.stringify(arg) || "").replace(cwd, ".");
    }
  }]);

  return Logger;
}();

LEVELS.forEach(function (_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2);

  var type = _ref4[0];
  var color = _ref4[1];

  if (!color) return; // "silent"
  var style = _chalk2.default[color];
  var level = TYPE_TO_LEVEL[type];
  Logger.prototype[type] = function (message, error) {
    this._log(type, style, level, message, error);
  };
});

var logger = new Logger();

exports.default = logger;
module.exports = exports["default"];