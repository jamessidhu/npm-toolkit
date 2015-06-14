// define dependencies
var _ = require('lodash');
var Constants = require('../../constants');
var Helpers = require('../helpers');
var NTInterfaceCLIFactory = require('../NTInterfaceCLI');

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

  var output = [];
  _.forEach(optsFiltered, function (option) {
    var type = option.type.toLowerCase();
    if (type === 'separator') {
      output.push(NTInterfaceCLIFactory.helpers.separator);
    } else {
      output.push(option.name);
    }
  });

  return {
    main: {
      type: "list",
      name: "main",
      message: "Choose a task",
      choices: output
    }
  };
};


/**
 * Produce CLI script
 * Outputs Inquirer friendly 'ask' function
 * @param screen The screen to process (def. 'main')
 */
var produceCLIScript = function (screen) {
  // replace inq-script: write a exit script / command launcher parser here
  // return require(Constants.SETTINGS_DIR + '/inq-script');

  screen = 'main';
  var screenData = Helpers.getScreenDefinition();
  var optsFiltered = filterScreenOptions(screenData);

  var fallbackFn = function () {
    console.log('\n\n -- Fallback warning --');
    console.log(' Task not implemented');
    console.log(' Answers given: ' + JSON.stringify(answers));
    console.log();
  };

  var returnable = function (answers) {
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

      var availableTasks = Helpers.scanTasks(Constants.SETTINGS_DIR);
      var taskExists = _.has(availableTasks, task);
      if (taskExists) {
        return require(Constants.SETTINGS_DIR + '/tasks/' + task)();
      }
      console.log('\n:-( Task "' + task + '" not found.');
      console.log('Type "npm-toolkit list" to see available tasks.\n');
      return;
    }

    if (type === 'menu') {
      console.log('Tried to launch menu: ' + answer.opts);
      return console.log('    :-( Sorry, submenus not implemented yet\n');

    }

    if (type === 'command') {
      console.log('Tried to launch: ' + answer.opts);
      return console.log('    :-( Sorry, launching top level commands not implemented yet\n');
    }

    if (type === 'exit') {
      return console.log('    _o/ Bye!\n');
    }

    if (type === 'restart') {
      return console.log('    Will restart, hold on.\n');
    }

    return fallbackFn();
  };

  return returnable;
};


// Export the function
module.exports = function (opts) {
  var settingsExist = true;
  if (!settingsExist) {
    console.log();
    console.log('npm-toolkit installation not found in current location or in the folders above.');
    console.log();
    console.log('You can initialise it in current folder with command:');
    console.log('   npm-toolkit init');
    console.log();
    console.log('You can also initialise it with some example data:');
    console.log('   npm-toolkit init --e=true');
    console.log();
    return;
  }

  var NTInterfaceCLI = NTInterfaceCLIFactory(produceCLIScreen(), produceCLIScript());
  NTInterfaceCLI.ask();

};