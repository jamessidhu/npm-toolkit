// define dependencies
var _ = require('lodash');
var config = require('../config');
var Helpers = require('../lib/helpers');
var loadTasks = require('../lib/loadTasks');
var NTInterfaceCLIFactory = require('../lib/NTInterfaceCLI');
var parseCliArgs = require('../lib/parseCliArgs');

var args = parseCliArgs();
var verbose = args.opts.verbose;

//Preprocessing functions

var filterScreenOptions = function (screenData, style) {
  var optsFiltered = [];

  _.forEach(screenData, function (option) {
    var showOption = true;
    if (option.disabled) showOption = false;
    if (!_.includes(option.interfaces, 'cli')) showOption = false;

    if (showOption) {
      optsFiltered.push(option);
    }
  });

  return optsFiltered;
};

/**
 * Produce CLI screen
 * Outputs Inquirer friendly 'questions' object
 * @param screen The screen to display (def. 'main')
 */
var produceCLIScreen = function (screen) {
  var screenData = Helpers.getScreenDefinition(screen);
  var optsFiltered = filterScreenOptions(screenData);
  var returnable = {};

  var output = [];
  _.forEach(optsFiltered, function (option) {
    if (verbose) console.log(option);
    var type = option.type.toLowerCase();
    if (type === 'separator') {
      output.push(NTInterfaceCLIFactory.helpers.separator);
    } else {
      output.push(option.name);
    }
  });
  //temporary override
  screen = 'main';
  returnable[screen] = {
    type: "list",
    name: screen,
    message: "Choose a task",
    choices: output
  };

  return returnable;
};


/**
 * Produce CLI script
 * Outputs Inquirer friendly 'ask' function
 * @param screen The screen to process (def. 'main')
 */
var produceCLIScript = function (screen) {
  // replace inq-script: write a exit script / command launcher parser here
  // return require(config.resolved.ntrc + '/inq-script');

  var screenData = Helpers.getScreenDefinition(screen);
  var optsFiltered = filterScreenOptions(screenData);

  var fallbackFn = function () {
    console.log('\n\n -- Fallback warning --');
    console.log(' Task not implemented');
    console.log(' Answers given: ' + JSON.stringify(answers));
    console.log();
  };

  var returnable = function (answers) {
    if (verbose) console.log(screen);
    if (verbose) console.log(answers);
    //temporary override
    screen = 'main';
    var answer = _.findWhere(optsFiltered, {'name': answers[screen]});
    var type = answer.type.toLowerCase();

    if (type === 'launch') {
      var input = answer.opts.split(' ');
      var task = input.shift();
      // var displayStyle = displayInfo ? 'detailed' : 'short';
      // if (task === 'log') displayStyle = false;
      // if (displayStyle) {
      //   Helpers.printHeader(displayStyle);
      // }
      //
      // if (displayStyle === 'detailed') {
      //   console.log(chalk.bold('Executing a task: ') + inputCommands.join(' '));
      // }

      var availableTasks = loadTasks(config.resolved.ntrc);
      var taskExists = _.includes(availableTasks, task);

      if (taskExists) {
        return loadTasks(config.resolved.ntrc, task)();
      }
      console.log('\n:-( Task "' + task + '" not found.');
      console.log('Type "nt list" to see available tasks.\n');
      return;
    }

    if (type === 'menu') {
      //console.log('Tried to launch menu: ' + answer.opts);
      //return console.log('    :-( Sorry, submenus not implemented yet\n');
      return initialisePrompt(answer.opts);
    }

    if (type === 'command') {
      return console.log(':-( Sorry, launching top level commands not implemented yet. Type "nt ' + answer.opts + '"\n');
    }

    if (type === 'exit') {
      return console.log('    _o/ Bye!\n');
    }

    if (type === 'restart') {
      return initialisePrompt('main');
    }

    return fallbackFn();
  };

  return returnable;
};


var initialisePrompt = function (screen) {
  screen = screen || 'main';
  var NTInterfaceCLI = NTInterfaceCLIFactory(produceCLIScreen(screen), produceCLIScript(screen));
  NTInterfaceCLI.ask();
};

// Export the function
module.exports = function (opts) {
  var settingsExist = config.initialised;
  if (!settingsExist) {
    console.log();
    console.log('npm-toolkit installation not found in current location or in the folders above.');
    console.log();
    // console.log('You can initialise it in current folder with command:');
    // console.log('   nt make ntrc');
    console.log();
    return;
  }

  initialisePrompt();
};