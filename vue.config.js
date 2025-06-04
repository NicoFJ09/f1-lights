const path = require('path');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/f1-lights/' : '/',
  
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
}