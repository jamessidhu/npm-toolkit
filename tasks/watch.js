var _ = require('lodash');
var fs = require('fs');
var chalk  = require('chalk');
var Helpers = require('../lib/helpers');
var loadTasks = require('../lib/loadTasks');
var config = require('../../config');

module.exports = function (opts) {
  var inputCommands = opts._;
  var displayInfo = !opts.quiet;
  inputCommands.shift();
  var immediateTask = inputCommands[0];
  var availableTasks = loadTasks(config.resolved.ntrc);
  var taskDefined = _.has(availableTasks, immediateTask);
  var fn, result;

  if (taskDefined) {
    if (displayInfo) result = chalk.bold('Executing a task: ') + inputCommands.join(' ');
    fn = _.get(availableTasks, immediateTask);

    if (immediateTask === 'log') {
      displayInfo = false;
      result = null;
    }
  } else {
    result = chalk.bold('Task "' + immediateTask + '" not found.');
    result += '\nType "nt list" for the list of available tasks.';
  }

  Helpers.printHeader();

  if (result) console.log(result);
  if (fn && typeof fn === 'function') fn(opts);
  Helpers.printLine();
};
