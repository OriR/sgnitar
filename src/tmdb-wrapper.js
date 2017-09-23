import tmdb from 'themoviedb-javascript-library';
tmdb.common.api_key = 'cc4b67c52acb514bdf4931f7cedfd12b';

export default Object.keys(tmdb).reduce((wrapper, key) => {
  if (key === 'common') {
    wrapper[key] = tmdb[key];
    return wrapper;
  }

  wrapper[key] = Object.keys(tmdb[key]).reduce((wrapperForKey, action) => {
    wrapperForKey[action] = (...args) => {
      return new Promise((resolve, reject) => {
        tmdb[key][action](...args, (responseText) => {
          resolve(JSON.parse(responseText));
        }, (responseText) => {
          let responseObject;

          try {
            responseObject = JSON.parse(responseText);
          } catch(e) {
            responseObject = { error: 'unknown' }
          }

          reject(responseObject);
        })
      });
    };
    return wrapperForKey;
  }, {});

  return wrapper;
}, {});
