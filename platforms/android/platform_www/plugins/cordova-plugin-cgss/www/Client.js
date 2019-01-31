cordova.define("cordova-plugin-cgss.Client", function(require, exports, module) {
var exec = require('cordova/exec');

exports.check = function () {
  return new Promise((resolve, reject) => {
    exec((resver) => resolve(resver), (err) => reject(new Error(err)), 'Client', 'check', [])
  })
};

});
