var exec = require('cordova/exec');

exports.check = function () {
  return new Promise((resolve, reject) => {
    exec((resver) => resolve(resver), (err) => reject(new Error(err)), 'Client', 'check', [])
  })
};
