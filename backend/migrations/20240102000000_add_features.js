/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('student_preferences', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('internship_id').unsigned().notNullable().references('id').inTable('internships').onDelete('CASCADE');
      table.integer('rank').notNullable();
      table.unique(['user_id', 'internship_id']);
      table.unique(['user_id', 'rank']);
    })
    .createTable('allocations', table => {
        table.increments('id').primary();
        table.integer('student_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE').unique();
        table.integer('internship_id').unsigned().notNullable().references('id').inTable('internships').onDelete('CASCADE');
        table.float('match_score');
        table.enum('status', ['Matched', 'Pending Acceptance', 'Accepted', 'Declined']).defaultTo('Matched');
        table.timestamps(true, true);
    })
    .createTable('audit_logs', table => {
        table.increments('id').primary();
        table.string('initiated_by').notNullable();
        table.enum('status', ['Running', 'Completed', 'Failed']).notNullable();
        table.text('details');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('allocations')
    .dropTableIfExists('student_preferences');
};
