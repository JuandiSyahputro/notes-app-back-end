require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const connection = require('./connection');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5001,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const dbPlugin = {
    name: 'dbPlugin',
    register: async function (server) {
      server.app.db = connection;
    },
  };

  await server.register(dbPlugin);

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
