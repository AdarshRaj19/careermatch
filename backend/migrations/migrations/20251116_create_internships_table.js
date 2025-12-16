exports.up = function (knex) {
  return knex.schema.createTable('internships', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.string('organization').notNullable();
    table.string('location');
    table.text('description').notNullable();
    table.string('stipend');
    table.string('duration');
    table.string('status').defaultTo('Active');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('internships');
};
