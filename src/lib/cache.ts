'use strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const wechatFilePath = path.join(process.cwd(), './cache/cache.txt');

const readFileAsync = function (filePath, options) {
  return new Promise(resolve => {
    fs.readFile(filePath, options, (err, content) => {
      if (err) {
        resolve('""');
      } else {
        resolve(content);
      }
    });
  });
};

const writeFileAsync = function (filePath, content) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(wechatFilePath), err => {
      if (err) return false;
      fs.writeFile(filePath, content, err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  });
};

function LocalCache() {
  let _cache = Object.create(null);
  let _hitCount = 0;
  let _missCount = 0;
  let _size = 0;
  let _debug = false;

  this.put = function (key, value, time, timeoutCallback, action) {
    if (_debug) {
      console.log('caching: %s = %j (@%s)', key, value, time);
    }

    if (
      typeof time !== 'undefined' &&
      (typeof time !== 'number' || isNaN(time) || time <= 0)
    ) {
      throw new Error('LocalCache timeout must be a positive number');
    } else if (
      typeof timeoutCallback !== 'undefined' &&
      typeof timeoutCallback !== 'function'
    ) {
      throw new Error('LocalCache timeout callback must be a function');
    }

    const oldRecord = _cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      _size++;
    }

    const record = {
      value: value,
      expire: time + Date.now(),
    } as any;

    if (!isNaN(record.expire)) {
      record.timeout = setTimeout(() => {
        _del(key);
        if (timeoutCallback) {
          timeoutCallback(key, value);
        }
      }, time);
    }

    _cache[key] = record;

    this.writeLocal(action);

    return value;
  };

  this.del = function (key, action) {
    let canDelete = true;

    const oldRecord = _cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
      if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
        canDelete = false;
      }
    } else {
      canDelete = false;
    }

    if (canDelete) {
      _del(key);
      this.writeLocal(action);
    }

    return canDelete;
  };

  function _del(key) {
    _size--;
    delete _cache[key];
  }

  this.clear = function () {
    for (const key in _cache) {
      clearTimeout(_cache[key].timeout);
    }
    _size = 0;
    _cache = Object.create(null);
    if (_debug) {
      _hitCount = 0;
      _missCount = 0;
    }

    return writeFileAsync(wechatFilePath, '');
  };

  this.get = function (key) {
    const data = _cache[key];
    if (typeof data !== 'undefined') {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        if (_debug) _hitCount++;
        return data.value;
      } else {
        // free some space
        if (_debug) _missCount++;
        _size--;
        delete _cache[key];
      }
    } else if (_debug) {
      _missCount++;
    }
    return null;
  };

  this.size = function () {
    return _size;
  };

  this.memsize = function () {
    let size = 0,
      key;
    for (key in _cache) {
      size++;
    }
    return size;
  };

  this.debug = function (bool) {
    _debug = bool;
  };

  this.hits = function () {
    return _hitCount;
  };

  this.misses = function () {
    return _missCount;
  };

  this.keys = function () {
    return Object.keys(_cache);
  };

  this.exportJson = function () {
    const plainJsCache = {};

    // Discard the `timeout` property.
    // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
    for (const key in _cache) {
      if (Object.prototype.hasOwnProperty.call(_cache, key)) {
        const record = _cache[key];
        plainJsCache[key] = {
          value: record.value,
          expire: record.expire || 'NaN',
        };
      }
    }
    return JSON.stringify(plainJsCache);
  };

  this.importJson = function (jsonToImport, options, cb) {
    const cacheToImport = JSON.parse(jsonToImport);
    const currTime = Date.now();

    const skipDuplicates = options && options.skipDuplicates;

    for (const key in cacheToImport) {
      if (Object.prototype.hasOwnProperty.call(cacheToImport, key)) {
        if (skipDuplicates) {
          const existingRecord = _cache[key];
          if (existingRecord) {
            if (_debug) {
              console.log("Skipping duplicate imported key '%s'", key);
            }
            continue;
          }
        }

        const record = cacheToImport[key];

        // record.expire could be `'NaN'` if no expiry was set.
        // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
        let remainingTime = record.expire - currTime;

        if (remainingTime <= 0) {
          // Delete any record that might exist with the same key, since this key is expired.
          this.del(key);
          continue;
        }

        // Remaining time must now be either positive or `NaN`,
        // but `put` will throw an error if we try to give it `NaN`.
        remainingTime = remainingTime > 0 ? remainingTime : undefined;

        this.put(key, record.value, remainingTime, cb, 'importJson');
      }
    }

    return this.size();
  };
}

LocalCache.prototype.init = async function (cb) {
  const jsonStr = (await readFileAsync(wechatFilePath, 'utf8')) as string;
  try {
    this.importJson(jsonStr, cb);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log(e);
    return {};
  }
};

// @params action 操作, 当为 importJson 不写文件
LocalCache.prototype.writeLocal = function (action) {
  if (action !== 'importJson') {
    writeFileAsync(wechatFilePath, this.exportJson()).then(() => {
      console.log('cache success=====');
    });
  }
};

export default new LocalCache();
