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
 * depended on if a few places) and then memoized.
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
  onNode: (V, N) => *,
): V {
  const directDependencies = [];
  const allDependencies = [];
  const seen = new Set();
  const toVisit = new Set(node.dependencies.map(dep => dep.id));
  for (let i = 0; i < node.dependencies.length; i++) {
    const dep = node.dependencies[i];
    if (toVisit.delete(dep.id)) {
      let value = memoized.get(dep.id);
      if (value == null) {
        value = topologicalFoldImpl(dep, f, memoized, (value, dep) => {
          if (toVisit.delete(dep.id)) {
            directDependencies.push(value);
          }
          if (!seen.has(dep.id)) {
            allDependencies.push(value);
          }
          seen.add(dep.id);
          return onNode(value, dep);
        });
        memoized.set(dep.id, value);
      }
      directDependencies.push(value);
    }
  }
  return onNode(f(directDependencies, allDependencies, node), node);
}
