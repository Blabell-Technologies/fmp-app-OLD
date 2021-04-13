module.exports = {
  apps : [{
    name: 'APP',
    script: 'index.js',
    watch: ["index.js"],
    ignore_watch: ["logs"],
    watch_options: {
      "followSymlinks": false
    }
  }]
};
