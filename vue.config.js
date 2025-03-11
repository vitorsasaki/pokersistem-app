module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '/pokersistem': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
};
