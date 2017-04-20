'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortTrees = sortTrees;
exports.recurseTree = recurseTree;
exports.getFormattedOutput = getFormattedOutput;


// public


// types
function sortTrees(trees) {
  return trees.sort(function (tree1, tree2) {
    return tree1.name.localeCompare(tree2.name);
  });
}

function recurseTree(tree, level, recurseFunc) {
  const treeLen = tree.length;
  const treeEnd = treeLen - 1;
  for (let i = 0; i < treeLen; i++) {
    recurseFunc(tree[i], level + 1, i === treeEnd);
  }
}

function getFormattedOutput(fmt) {
  const item = formatColor(fmt.color, fmt.name, fmt.formatter);
  const indent = getIndent(fmt.end, fmt.level);
  const suffix = getSuffix(fmt.hint, fmt.formatter);
  return `${indent}─ ${item}${suffix}\n`;
}

function getIndentChar(end) {
  return end ? '└' : '├';
}

function getIndent(end, level) {
  const base = '│  '.repeat(level);
  const indentChar = getIndentChar(end);
  const hasLevel = base + indentChar;
  return level ? hasLevel : indentChar;
}

function getSuffix(hint, formatter) {
  return hint ? ` (${formatter.grey(hint)})` : '';
}

function formatColor(color, strToFormat, formatter) {
  return color ? formatter[color](strToFormat) : strToFormat;
}