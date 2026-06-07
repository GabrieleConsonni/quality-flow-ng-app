const PROXY_CONFIG = {

  '/api': {
      target: 'http://127.0.0.1:9082',
      secure: false,
      changeOrigin: true,
      withCredentials: false,
      logLevel: 'debug',
  },

  '/public': {
      target: 'http://127.0.0.1:9082',
      secure: false,
      changeOrigin: true,
      withCredentials: false,
      logLevel: 'debug',
  },

};

module.exports = PROXY_CONFIG;
