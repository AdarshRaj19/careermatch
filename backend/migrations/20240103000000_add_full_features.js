/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('notifications', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('type').notNullable();
      table.string('title').notNullable();
      table.text('text');
      table.string('link');
      table.boolean('is_read').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('saved_items', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('item_id').notNullable();
      table.enum('item_type', ['course', 'internship']).notNullable();
      table.unique(['user_id', 'item_id', 'item_type']);
    })
    .createTable('student_courses', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('course_id').unsigned().notNullable().references('id').inTable('courses').onDelete('CASCADE');
        table.integer('progress').defaultTo(0);
        table.enum('status', ['in-progress', 'completed']).defaultTo('in-progress');
        table.unique(['user_id', 'course_id']);
    })
    .createTable('upload_history', table => {
        table.increments('id').primary();
        table.string('filename').notNullable();
        table.enum('status', ['Completed', 'Failed']).notNullable();
        table.string('user').notNullable();
        table.integer('records').nullable();
        table.string('error_message').nullable();
        table.timestamps(true, true);
    })
    .alterTable('student_profiles', table => {
        table.boolean('consent_resume_parsing').defaultTo(true);
        table.boolean('consent_profile_sharing').defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('student_profiles', table => {
        table.dropColumn('consent_resume_parsing');
        table.dropColumn('consent_profile_sharing');
    })
    .dropTableIfExists('upload_history')
    .dropTableIfExists('student_courses')
    .dropTableIfExists('saved_items')
    .dropTableIfExists('notifications');
};