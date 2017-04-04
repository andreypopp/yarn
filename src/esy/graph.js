/**
 * @flow
 */

type Node<N: Node<*>> = {
  id: string,
  dependencies: Map<string, N>,
};

/**
 * BF traverse for a dep graph.
 */
export function traverse<N: Node<*>>(node: N, f: (N) => void) {
  const seen = new Set();
  const queue = [node];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (seen.has(cur.id)) {
      continue;
    }
    f(cur);
    seen.add(cur.id);
    queue.push(...cur.dependencies.values());
  }
}

/**
 * DF traverse for a dep graph.
 */
export function traverseDeepFirst<N: Node<*>>(node: N, f: (N) => void) {
  const seen = new Set();
  function traverse(node) {
    if (seen.has(node.id)) {
      return;
    }
    seen.add(node.id);
    for (const dep of node.dependencies.values()) {
      traverse(dep);
    }
    f(node);
  }
  traverse(node);
}

/**
 * Collect all transitive dependendencies for a node.
 */
export function collectTransitiveDependencies<N: Node<*>>(node: N): N[] {
  const dependencies = [];
  traverseDeepFirst(node, cur => {
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
export function topologicalFold<N: Node<*>, V>(
  node: N,
  f: (
    directDependencies: Map<string, V>,
    allDependencies: Map<string, V>,
    currentNode: N,
  ) => V,
): V {
  return topologicalFoldImpl(node, f, new Map(), value => value);
}

function topologicalFoldImpl<N: Node<*>, V>(
  node: N,
  f: (Map<string, V>, Map<string, V>, N) => V,
  memoized: Map<string, V>,
  onNode: (V, N) => V,
): V {
  const cached = memoized.get(node.id);
  if (cached != null) {
    return onNode(cached, node);
  } else {
    const directDependencies = new Map();
    const allDependencies = new Map();
    const need = new Set(node.dependencies.keys());
    for (const dep of node.dependencies.values()) {
      topologicalFoldImpl(dep, f, memoized, (value, node) => {
        if (!allDependencies.has(node.id)) {
          allDependencies.set(node.id, value);
        }
        if (need.delete(node.id) && !directDependencies.has(node.id)) {
          directDependencies.set(node.id, value);
        }
        return onNode(value, node);
      });
    }
    const value = f(directDependencies, allDependencies, node);
    memoized.set(node.id, value);
    return onNode(value, node);
  }
}
