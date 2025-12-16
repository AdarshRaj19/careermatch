module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './data.sqlite3'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA journal_mode = WAL;', done);
      }
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
};
