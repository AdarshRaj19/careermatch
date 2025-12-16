exports.up = function (knex) {
  return knex.schema.hasTable("student_profiles").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("student_profiles", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().references("id").inTable("users");
        table.string("name").notNullable();
        table.string("email").notNullable();
        table.text("skills").defaultTo("[]");
      });
    }
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("student_profiles");
};
