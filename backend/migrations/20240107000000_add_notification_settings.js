
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notification_settings', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE').unique();
    table.boolean('new_internship_alerts').defaultTo(true);
    table.enum('alert_frequency', ['instant', 'daily', 'weekly']).defaultTo('daily');
    table.boolean('alert_method_in_app').defaultTo(true);
    table.boolean('alert_method_email').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notification_settings');
};
