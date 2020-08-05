import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("classes", (table) => {
    table.increments("id").primary();
    table.string("subject").notNullable();
    table.decimal("cost").notNullable();

    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      // O que acontece com o id do usuário da tabela users se este id for alterado:
      .onUpdate("CASCADE")
      // O que acontece caso as aulas de um professor caso este seja deletado da plataforma:
      .onDelete("CASCADE"); // CASCADE: as aulas são deletadas junto com o professor
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("classes");
}
