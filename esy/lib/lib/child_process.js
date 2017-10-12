'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawn = spawn;
var child_process = require('child_process');

function spawn(program, args) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var onData = arguments[3];

  return new Promise(function (resolve, reject) {
    var proc = child_process.spawn(program, args, opts);

    var processingDone = false;
    var processClosed = false;
    var err = null;

    var stdout = '';

    proc.on('error', function (err) {
      if (err.code === 'ENOENT') {
        reject(new Error(`Couldn't find the binary ${program}`));
      } else {
        reject(err);
      }
    });

    function updateStdout(chunk) {
      stdout += chunk;
      if (onData) {
        onData(chunk);
      }
    }

    function finish() {
      if (err) {
        reject(err);
      } else {
        resolve(stdout.trim());
      }
    }

    if (typeof opts.process === 'function') {
      opts.process(proc, updateStdout, reject, function () {
        if (processClosed) {
          finish();
        } else {
          processingDone = true;
        }
      });
    } else {
      if (proc.stderr) {
        proc.stderr.on('data', updateStdout);
      }

      if (proc.stdout) {
        proc.stdout.on('data', updateStdout);
      }

      processingDone = true;
    }

    proc.on('close', function (code) {
      if (code >= 1) {
        // TODO make this output nicer
        err = new Error(['Command failed.', `Exit code: ${code}`, `Command: ${program}`, `Arguments: ${args.join(' ')}`, `Directory: ${opts.cwd || process.cwd()}`, `Output:\n${stdout.trim()}`].join('\n'));
        // $FlowFixMe: ...
        err.EXIT_CODE = code;
      }

      if (processingDone || err) {
        finish();
      } else {
        processClosed = true;
      }
    });
  });
}