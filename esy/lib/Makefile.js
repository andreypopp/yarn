'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderMakefile = renderMakefile;

var _outdent;

function _load_outdent() {
  return _outdent = _interopRequireDefault(require('outdent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderMakefile(items) {
  return items.map(function (item) {
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
} /**
   * Utilities for programmatic Makefile genetation.
   *
   * 
   */

function renderMakeDefine(_ref) {
  var name = _ref.name,
      value = _ref.value;

  return `define ${name}\n${escapeEnvVar(renderMakeRuleCommand(value))}\nendef`;
}

function renderMakeFile(_ref2) {
  var filename = _ref2.filename,
      value = _ref2.value,
      target = _ref2.target,
      _ref2$dependencies = _ref2.dependencies,
      dependencies = _ref2$dependencies === undefined ? [] : _ref2$dependencies;

  var id = escapeName(filename);
  var output = (_outdent || _load_outdent()).default`
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
    output += `\n${target}: ${filename}`;
  }
  return output;
}

function renderMakeRawItem(_ref3) {
  var value = _ref3.value;

  return value;
}

function renderMakeRule(rule) {
  var target = rule.target,
      _rule$dependencies = rule.dependencies,
      dependencies = _rule$dependencies === undefined ? [] : _rule$dependencies,
      command = rule.command,
      phony = rule.phony,
      env = rule.env,
      exportEnv = rule.exportEnv,
      shell = rule.shell;

  var header = `${target}: ${dependencies.join(' ')}`;

  var prelude = '';
  if (exportEnv) {
    exportEnv.forEach(function (name) {
      prelude += `export ${name}\n`;
    });
  }

  if (phony) {
    prelude += `.PHONY: ${target}\n`;
  }

  if (shell != null) {
    prelude += `${target}: SHELL=${shell}\n`;
  }

  if (command != null) {
    var recipe = escapeEnvVar(renderMakeRuleCommand(command));
    if (env) {
      var envString = renderMakeRuleEnv(env);
      return `${prelude}${header}\n${envString}\\\n${recipe}`;
    } else {
      return `${prelude}${header}\n${recipe}`;
    }
  } else {
    return prelude + header;
  }
}

function renderMakeRuleEnv(env) {
  var lines = [];
  for (var k in env) {
    if (env[k] != null) {
      lines.push(`\texport ${k}="${env[k]}";`);
    }
  }
  return lines.join('\\\n');
}

function renderMakeRuleCommand(command) {
  if (Array.isArray(command)) {
    return command.filter(function (item) {
      return item != null;
    }).map(function (item) {
      return typeof item === 'string' ? renderMakeRuleCommand(item) : renderMakeRuleEnv(item);
    }).join('\\\n');
  } else {
    return command.split('\n').map(function (line) {
      return `\t${line};`;
    }).join('\\\n');
  }
}

function escapeEnvVar(command) {
  return command.replace(/\$([^\(])/g, '$$$$$1');
}

function escapeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
}