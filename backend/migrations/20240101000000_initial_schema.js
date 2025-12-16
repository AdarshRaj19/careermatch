
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.enum('role', ['student', 'admin']).notNullable();
      table.timestamps(true, true);
    })
    .createTable('student_profiles', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name');
      table.string('email');
      table.string('phone');
      table.string('university');
      table.string('college');
      table.string('degree');
      table.string('branch');
      table.integer('year');
      table.string('cgpa');
      table.integer('creditsEarned');
      table.string('district');
      table.json('skills');
    })
    .createTable('internships', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('organization').notNullable();
      table.string('location');
      table.text('description');
      table.json('skills');
      table.enum('status', ['Active', 'Closed']).defaultTo('Active');
    })
    .createTable('courses', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('provider').notNullable();
        table.string('category');
        table.integer('hours');
        table.float('rating');
        table.text('description');
        table.enum('status', ['Active', 'Inactive', 'Blocked']).defaultTo('Active');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('courses')
    .dropTableIfExists('internships')
    .dropTableIfExists('student_profiles')
    .dropTableIfExists('users');
};
