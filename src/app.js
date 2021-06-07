module.exports = app => {
  app.messenger.on('access_token', data => {
    app.config.access_token = data;
    console.log('app: access_token update', data);
  });
  app.messenger.on('ticket', data => {
    app.config.ticket = data;
    console.log('app: ticket update', data);
  });
  app.messenger.on('test', data => {
    console.log('app: test update', data);
  });
  if (app.config.nacos) {
    app.messenger.on(app.config.nacos.dataId, data => {
      app.config[app.config.nacos.dataId] = data;
    });
  }
};
