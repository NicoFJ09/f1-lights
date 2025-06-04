const path = require('path');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/f1-lights/' : '/',
  
  chainWebpack: config => {
    // For images in src/assets (if any)
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'images/[name].[ext]',
        esModule: false
      });

    // For fonts
    config.module
      .rule('fonts')
      .test(/\.(ttf|otf|eot|woff|woff2)$/i)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'fonts/[name].[ext]',
        esModule: false
      });
  }
}