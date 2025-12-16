
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('support_tickets', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('subject').notNullable();
      table.text('message').notNullable();
      table.enum('status', ['Open', 'In Progress', 'Closed']).defaultTo('Open');
      table.timestamps(true, true);
    })
    .alterTable('notifications', table => {
        // This column might have been added in a previous migration.
        // We'll check if it exists before trying to add it to avoid errors.
        return knex.schema.hasColumn('notifications', 'is_read').then(exists => {
            if (!exists) {
                table.boolean('is_read').defaultTo(false);
            }
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('support_tickets')
    .alterTable('notifications', table => {
        return knex.schema.hasColumn('notifications', 'is_read').then(exists => {
            if (exists) {
                table.dropColumn('is_read');
            }
        });
    });
};
