var _ = require('lodash');
var getProjectEnvVarsDefList = require('./getProjectEnvVarsDefList');
var getProjectRootDir = require('./getProjectRootDir');
var readJson = require('./readJson');

/**
 * Fetches the env vars defined in .env.[key].json file (i.e. .env.qa.json)
 * If no env key is specified it fetches all .env files
 *
 * @param {string} env - Environment variant to use
 * @return {object} Flattened env vars object
 */
function getProjectEnvVars (envKeysIn) {
  var rtn = {};
  var root = getProjectRootDir();
  var envKeys;

  if (typeof envKeysIn === 'string') {
    envKeys = [envKeysIn];
  }
  if (Array.isArray(envKeysIn)) {
    envKeys = envKeysIn;
  } else {
    envKeys = getProjectEnvVarsDefList();
  }

  _.forEach(envKeys, function (key) {
    var filepath = root + '/.env.' + key + '.json';
    var envvars = readJson(filepath);
    rtn[key] = envvars;
  });

  if (typeof envKeysIn === 'string') {
    var overrides = rtn.overrides;

    rtn = rtn[envKeysIn];
    if (overrides) {
      rtn = _.merge({}, rtn, overrides);
    }
  }
  return rtn;
};

module.exports = getProjectEnvVars;
