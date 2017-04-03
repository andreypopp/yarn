/**
 * @flow
 */

type Node<N: Node<*>> = {
  id: string,
  dependencies: N[],
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
    queue.push(...cur.dependencies);
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
    for (const dep of node.dependencies) {
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
  f: (directDependencies: V[], allDependencies: V[], currentNode: N) => V,
): V {
  return topologicalFoldImpl(node, f, new Map(), value => value);
}

function topologicalFoldImpl<N: Node<*>, V>(
  node: N,
  f: (V[], V[], N) => V,
  memoized: Map<string, V>,
  onNode: (V, N) => V,
): V {
  const cached = memoized.get(node.id);
  if (cached != null) {
    return onNode(cached, node);
  } else {
    const directDependencies = [];
    const allDependencies = [];
    const seen = new Set();
    const need = new Set(node.dependencies.map(dep => dep.id));
    for (const dep of node.dependencies) {
      topologicalFoldImpl(dep, f, memoized, (value, node) => {
        if (!seen.has(node.id)) {
          allDependencies.push(value);
          seen.add(node.id);
        }
        if (need.delete(node.id)) {
          directDependencies.push(value);
        }
        return onNode(value, node);
      });
    }
    const value = f(directDependencies, allDependencies, node);
    memoized.set(node.id, value);
    return onNode(value, node);
  }
}
