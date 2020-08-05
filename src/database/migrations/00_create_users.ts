import Knex from "knex";

export async function up(knex: Knex) {
  // Para quais alterações nós queremos realizar no banco de dados
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // Campo do tipo inteiro com autoincremento
    table.string("name").notNullable(); // name: Campo de tipo varchar que não pode ser nulo
    table.string("avatar").notNullable(); // avatar: Campo de tipo varchar que não pode ser nulo
    table.string("whatsapp").notNullable(); // whatsapp: Campo de tipo varchar que não pode ser nulo
    table.string("bio").notNullable(); // bio: Campo de tipo varchar que não pode ser nulo
  });
}

export async function down(knex: Knex) {
  // Para recuperação em casos de erros
  return knex.schema.dropTable("users");
}
