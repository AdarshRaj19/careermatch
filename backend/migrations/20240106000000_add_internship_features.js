
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('internships', table => {
        table.enum('type', ['Remote', 'Hybrid', 'On-site']).defaultTo('On-site');
        table.enum('experienceLevel', ['Entry-level', 'Mid-level', 'Senior']).defaultTo('Entry-level');
    })
    .createTable('internship_applications', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('internship_id').unsigned().notNullable().references('id').inTable('internships').onDelete('CASCADE');
      table.enum('status', ['Applied', 'Interviewing', 'Offer Received']).notNullable();
      table.timestamps(true, true);
      table.unique(['user_id', 'internship_id']);
    })
    .createTable('saved_searches', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('name').notNullable();
        table.json('params').notNullable(); // Stores search term and filters
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('saved_searches')
    .dropTableIfExists('internship_applications')
    .alterTable('internships', table => {
        table.dropColumn('type');
        table.dropColumn('experienceLevel');
    });
};
