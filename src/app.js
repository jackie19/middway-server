module.exports = app => {
  app.messenger.on('update.access_token', data => {
    app.config.access_token = data.access_token;
  });
};
