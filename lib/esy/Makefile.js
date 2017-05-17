'use strict';

/**
 * Utilities for programmatic Makefile genetation.
 *
 * 
 */

const outdent = require('outdent');

function renderMakefile(items) {
  return items.map(item => {
    if (item.type === 'rule') {
      return renderMakeRule(item);
    } else if (item.type === 'define') {
      return renderMakeDefine(item);
    } else if (item.type === 'raw') {
      return renderMakeRawItem(item);
    } else if (item.type === 'file') {
      return renderMakeFile(item);
    } else {
      throw new Error('Unknown make item:' + JSON.stringify(item));
    }
  }).join('\n\n');
}

function renderMakeDefine(_ref) {
  let name = _ref.name,
      value = _ref.value;

  return `define ${name}\n${escapeEnvVar(renderMakeRuleCommand(value))}\nendef`;
}

function renderMakeFile(_ref2) {
  let filename = _ref2.filename,
      value = _ref2.value,
      target = _ref2.target;
  var _ref2$dependencies = _ref2.dependencies;
  let dependencies = _ref2$dependencies === undefined ? [] : _ref2$dependencies;

  let id = escapeName(filename);
  let output = outdent`
    define ${id}__CONTENTS
    ${escapeEnvVar(value)}
    endef

    export ${id}__CONTENTS

    .PHONY: ${filename}
    ${filename}: SHELL=/bin/bash
    ${filename}: ${dependencies.join(' ')}
    \tmkdir -p $(@D)
    \tprintenv "${id}__CONTENTS" > $(@)
  `;
  if (target) {
    output = output + `\n${target}: ${filename}`;
  }
  return output;
}

function renderMakeRawItem(_ref3) {
  let value = _ref3.value;

  return value;
}

function renderMakeRule(rule) {
  let target = rule.target;
  var _rule$dependencies = rule.dependencies;
  let dependencies = _rule$dependencies === undefined ? [] : _rule$dependencies,
      command = rule.command,
      phony = rule.phony,
      env = rule.env,
      exportEnv = rule.exportEnv,
      shell = rule.shell;

  let header = `${target}: ${dependencies.join(' ')}`;

  let prelude = '';
  if (exportEnv) {
    exportEnv.forEach(name => {
      prelude = prelude + `export ${name}\n`;
    });
  }

  if (phony) {
    prelude = prelude + `.PHONY: ${target}\n`;
  }

  if (shell != null) {
    prelude = prelude = `${target}: SHELL=${shell}\n`;
  }

  if (command != null) {
    let recipe = escapeEnvVar(renderMakeRuleCommand(command));
    if (env) {
      let envString = renderMakeRuleEnv(env);
      return `${prelude}${header}\n${envString}\\\n${recipe}`;
    } else {
      return `${prelude}${header}\n${recipe}`;
    }
  } else {
    return prelude + header;
  }
}

function renderMakeRuleEnv(env) {
  let lines = [];
  for (let k in env) {
    if (env[k] != null) {
      lines.push(`\texport ${k}="${env[k]}";`);
    }
  }
  return lines.join('\\\n');
}

function renderMakeRuleCommand(command) {
  if (Array.isArray(command)) {
    return command.filter(item => item != null).map(item => typeof item === 'string' ? renderMakeRuleCommand(item) : renderMakeRuleEnv(item)).join('\\\n');
  } else {
    return command.split('\n').map(line => `\t${line};`).join('\\\n');
  }
}

function escapeEnvVar(command) {
  return command.replace(/\$([^\(])/g, '$$$$$1');
}

function escapeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
}

module.exports = {
  renderMakefile
};