'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromEntries = fromEntries;
exports.merge = merge;
exports.printEnvironment = printEnvironment;

var _os;

function _load_os() {
  return _os = _interopRequireWildcard(require('os'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// X platform newline
var EOL = (_os || _load_os()).EOL;

function fromEntries(entries) {
  var env = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entry = _step.value;

      env.set(entry.name, entry);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return env;
}

function merge(items, merger) {
  return items.reduce(function (env, currentEnv) {
    return merger(env, Array.from(currentEnv.values()));
  }, new Map());
}

function printEnvironment(env) {
  var groupsByBuild = new Map();

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = env.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var item = _step2.value;

      var key = item.spec != null ? item.spec.id : 'Esy Sandbox';
      var header = item.spec != null ? `${item.spec.name}@${item.spec.version} ${item.spec.sourcePath}` : 'Esy Sandbox';
      var group = groupsByBuild.get(key);
      if (group == null) {
        group = { header, env: [] };
        groupsByBuild.set(key, group);
      }
      group.env.push(item);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return Array.from(groupsByBuild.values()).map(function (group) {
    var headerLines = [`# ${group.header}`];
    // TODO: add error rendering here
    // const errorLines = group.errors.map(err => {
    //   return '# [ERROR] ' + err;
    // });
    var envVarLines = group.env.map(function (item) {
      // TODO: escape " in values
      var exportLine = `export ${item.name}="${item.value}"`;
      return exportLine;
    });
    return headerLines.concat(envVarLines).join(EOL);
  }).join(EOL);
}