
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    tinify = require('tinify'),
    Jimp = require('jimp');

var config = {},
    allFiles = [],
    numberOfFiles = 0;

var utils = {
  _getAllFilesFromFolder: function(dir) {
      var results = [];
      fs.readdirSync(dir).forEach(function(file) {
          file = dir + '/' + file;
          var stat = fs.statSync(file);

          if (stat && stat.isDirectory()) {
              results = results.concat(utils._getAllFilesFromFolder(file))
          } else results.push(file);
      });

      return results;
  },

  _moveFile: function (sourcePath, destPath) {
    var source = fs.createReadStream(sourcePath),
        dest = fs.createWriteStream(destPath);

    source.pipe(dest);
    source.on('end', function() {
      console.log('File moved from ' + sourcePath + ' to ' + destPath);
    });
  },

  _addPrefix: function (filePath, prefix) {
    var ext = path.extname(filePath);
    return filePath.replace(ext, config.prefixSeparator + prefix + ext);
  },

  _doesExist: function (filePath) {
    try {
      fs.statSync(filePath)
      return true
    } catch(err) {
      return !(err && err.code === 'ENOENT');
    }
  },

  _copyFile: function (source, target, cb) {
      var cbCalled = false;

      var rd = fs.createReadStream(source);
      rd.on("error", function(err) {
        done(err);
      });
      var wr = fs.createWriteStream(target);
      wr.on("error", function(err) {
        done(err);
      });
      wr.on("close", function(ex) {
        done();
      });
      rd.pipe(wr);

      function done(err) {
        if (!cbCalled) {
          cb(err);
          cbCalled = true;
        }
      }
    },

    _reportProcessed: function () {
      numberOfFiles -= 1;

      if (numberOfFiles === 0) {
        console.log('All done.')
      } else if (numberOfFiles % 5 === 0) {
        console.log('Files to process: ', numberOfFiles);
      }
    }
};

var app = {
  run: function (targetPath, overwriteMode) {
    config = require(path.resolve(path.join(targetPath, 'tasvir.config.js')));

    config.overwriteMode = overwriteMode;
    if (config.tinify) {
      tinify.key = config.tinify.apiKey;
    }

    app.processPath(config.paths, targetPath, function () {
      numberOfFiles = allFiles.length;

      console.log('Files to process: ', numberOfFiles);
      allFiles.forEach(app.processFile);
    });
  },

  processPath: function (pathPatterns, targetPath, cb) {
    if (pathPatterns.length > 0) {
      glob(pathPatterns[0], { cwd: targetPath }, function (er, files) {
        files.forEach(function (file) {
          var filePath = path.join(targetPath, file);
          if (path.basename(filePath).indexOf(config.prefixSeparator) === -1) {
            allFiles.push(filePath);
          }
        });

        pathPatterns.shift();
        app.processPath(pathPatterns, targetPath, cb);
      });
    } else {
      cb();
    }
  },

  processFile: function (filePath) {
      if (config.tinify && config.tinify.enabled) {
        var origFilePath = utils._addPrefix(filePath, config.tinify.originalPrefix);
        if (!utils._doesExist(origFilePath) || config.overwriteMode) {
            utils._copyFile(filePath, origFilePath, function (err) {
              if (err) throw err;
              tinify.fromFile(filePath).toFile(filePath, function (err, resultData) {
                  if (err) throw err;
                  app.runRules(filePath);
              });
            });
        } else {
          app.runRules(filePath);
        }
      } else {
        app.runRules(filePath);
      }
  },

  runRules: function (filePath) {
    var output = new Jimp(filePath, function (err, image) {
      config.rules.forEach(function (rule) {
        rule.chain.forEach(function (action) {
            if (action.apply === 'write') {
              action.params = [ utils._addPrefix(filePath, action.prefix) ];
            } else {
              action.params.forEach(function (param, index) {
                if (param === 'AUTO') {
                    action.params[index] = Jimp.AUTO;
                }
              });
            }

            var fn = image[action.apply];
            if (!fn) {
              console.error('action ' + action.apply + ' was not found');
            } else {
              image = fn.apply(image, action.params);
            }
        });
      });
    });

    utils._reportProcessed();
  },

  flatten: function (targetPath) {
    var files = utils._getAllFilesFromFolder(targetPath),
        targetPathLength = targetPath.length;

    files.forEach(function (file) {
      var relPath = file.substr(targetPathLength + 1),
          newFilePath = path.join(targetPath, relPath.replace(/\\/g, '--').replace(/\//g, '--'));

      utils._moveFile(file, newFilePath);
    });
  }
};

module.exports = app;
