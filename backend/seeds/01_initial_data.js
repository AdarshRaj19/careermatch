const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse order of creation to ensure a clean slate.
  await knex('notification_settings').del();
  await knex('saved_searches').del();
  await knex('internship_applications').del();
  await knex('upload_history').del();
  await knex('student_courses').del();
  await knex('saved_items').del();
  await knex('notifications').del();
  await knex('student_preferences').del();
  await knex('allocations').del();
  await knex('audit_logs').del();
  await knex('courses').del();
  await knex('internships').del();
  await knex('student_profiles').del();
  await knex('users').del();

  // Create a default admin user
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
  await knex('users').insert({
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: adminPasswordHash,
    role: 'admin'
  });
};