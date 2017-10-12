"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2;

function _load_slicedToArray() {
  return _slicedToArray2 = _interopRequireDefault(require("babel-runtime/helpers/slicedToArray"));
}

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require("babel-runtime/helpers/toConsumableArray"));
}

exports.traverse = traverse;
exports.traverseDeepFirst = traverseDeepFirst;
exports.collectTransitiveDependencies = collectTransitiveDependencies;
exports.topologicalFold = topologicalFold;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * BF traverse for a dep graph.
 */
function traverse(node, f) {
  var seen = new Set();
  var queue = [node];
  while (queue.length > 0) {
    var cur = queue.shift();
    if (seen.has(cur.id)) {
      continue;
    }
    f(cur);
    seen.add(cur.id);
    queue.push.apply(queue, (0, (_toConsumableArray2 || _load_toConsumableArray()).default)(cur.dependencies.values()));
  }
}

/**
 * DF traverse for a dep graph.
 */


function traverseDeepFirst(node, f) {
  var seen = new Set();
  function traverse(node) {
    if (seen.has(node.id)) {
      return;
    }
    seen.add(node.id);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = node.dependencies.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dep = _step.value;

        traverse(dep);
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

    f(node);
  }
  traverse(node);
}

/**
 * Collect all transitive dependendencies for a node.
 */
function collectTransitiveDependencies(node) {
  var dependencies = [];
  traverseDeepFirst(node, function (cur) {
    // Skip the root node
    if (cur !== node) {
      dependencies.push(cur);
    }
  });
  dependencies.reverse();
  return dependencies;
}

/**
 * Topological fold for a dependency graph to a value of type `V`.
 *
 * The fold function is called with a list of values computed for dependencies
 * in topological order and a node itself.
 *
 * Note that value is computed only once per node (even if it happen to be
 * depended on in several places) and then memoized.
 */
function topologicalFold(node, f) {
  return topologicalFoldImpl(node, f, new Map(), function (value) {
    return value;
  });
}

function topologicalFoldImpl(node, f, memoized, onNode) {
  var cached = memoized.get(node.id);
  if (cached != null) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = cached.allDependencies.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _ref = _step2.value;

        var _ref2 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref, 2);

        var _id = _ref2[0];
        var _value = _ref2[1];

        onNode(_value, _id);
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

    return onNode(cached.value, node.id);
  } else {
    var _ret = function () {
      var directDependencies = new Map();
      var allDependencies = new Map();
      var need = new Set(node.dependencies.keys());
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = node.dependencies.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var dep = _step3.value;

          topologicalFoldImpl(dep, f, memoized, function (value, id) {
            if (!allDependencies.has(id)) {
              allDependencies.set(id, value);
            }
            if (need.delete(id) && !directDependencies.has(id)) {
              directDependencies.set(id, value);
            }
            return onNode(value, id);
          });
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var value = f(directDependencies, allDependencies, node);
      memoized.set(node.id, { value, allDependencies });
      return {
        v: onNode(value, node.id)
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }
}