"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _GitUtilities = require("./GitUtilities");

var _GitUtilities2 = _interopRequireDefault(_GitUtilities);

var _FileSystemUtilities = require("./FileSystemUtilities");

var _FileSystemUtilities2 = _interopRequireDefault(_FileSystemUtilities);

var _PackageUtilities = require("./PackageUtilities");

var _PackageUtilities2 = _interopRequireDefault(_PackageUtilities);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _logger = require("./logger");

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_PACKAGE_GLOB = "packages/*/package.json";

var Repository = function () {
  function Repository() {
    _classCallCheck(this, Repository);

    if (!_GitUtilities2.default.isInitialized()) {
      _logger2.default.info("Initializing Git repository.");
      _GitUtilities2.default.init();
    }

    this.rootPath = _path2.default.resolve(_GitUtilities2.default.getTopLevelDirectory());
    this.asiniJsonLocation = _path2.default.join(this.rootPath, "asini.json");
    this.packageJsonLocation = _path2.default.join(this.rootPath, "package.json");
    this.packagesLocation = _path2.default.join(this.rootPath, "packages"); // TODO: Kill this.

    // Legacy
    this.versionLocation = _path2.default.join(this.rootPath, "VERSION");

    if (_FileSystemUtilities2.default.existsSync(this.asiniJsonLocation)) {
      this.asiniJson = JSON.parse(_FileSystemUtilities2.default.readFileSync(this.asiniJsonLocation));
    }

    if (_FileSystemUtilities2.default.existsSync(this.packageJsonLocation)) {
      this.packageJson = JSON.parse(_FileSystemUtilities2.default.readFileSync(this.packageJsonLocation));
    }
  }

  _createClass(Repository, [{
    key: "isIndependent",
    value: function isIndependent() {
      return this.version === "independent";
    }
  }, {
    key: "buildPackageGraph",
    value: function buildPackageGraph(_ref) {
      var scope = _ref.scope;
      var ignore = _ref.ignore;


      // TODO: Replace these with a nicer config sieve.
      if (this.constructor.name === "BootstrapCommand") {
        ignore = ignore || this.bootstrapConfig.ignore;
      }
      if (this.constructor.name === "PublishCommand") {
        ignore = ignore || this.publishConfig.ignore;
      }

      this._packages = _PackageUtilities2.default.getPackages(this);
      this._packageGraph = _PackageUtilities2.default.getPackageGraph(this._packages);
      this._filteredPackages = _PackageUtilities2.default.getFilteredPackages(this._packages, { scope: scope, ignore: ignore });
    }
  }, {
    key: "asiniVersion",
    get: function get() {
      return this.asiniJson && this.asiniJson.asini;
    }
  }, {
    key: "version",
    get: function get() {
      return this.asiniJson && this.asiniJson.version;
    }
  }, {
    key: "publishConfig",
    get: function get() {
      return this.asiniJson && this.asiniJson.publishConfig || {};
    }
  }, {
    key: "bootstrapConfig",
    get: function get() {
      return this.asiniJson && this.asiniJson.bootstrapConfig || {};
    }
  }, {
    key: "packageConfigs",
    get: function get() {
      return (this.asiniJson || {}).packages || [{
        glob: DEFAULT_PACKAGE_GLOB
      }];
    }
  }, {
    key: "packages",
    get: function get() {
      if (!this._packages) {
        this.buildPackageGraph();
      }
      return this._packages;
    }
  }, {
    key: "filteredPackages",
    get: function get() {
      if (!this._filteredPackages) {
        this.buildPackageGraph();
      }
      return this._filteredPackages;
    }
  }, {
    key: "packageGraph",
    get: function get() {
      if (!this._packageGraph) {
        this.buildPackageGraph();
      }
      return this._packageGraph;
    }
  }]);

  return Repository;
}();

exports.default = Repository;
module.exports = exports["default"];