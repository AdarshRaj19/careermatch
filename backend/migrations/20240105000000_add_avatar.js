
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('student_profiles', table => {
    table.string('avatar_url').nullable();
    table.string('resume_url').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('student_profiles', table => {
    table.dropColumn('avatar_url');
    table.dropColumn('resume_url');
  });
};
