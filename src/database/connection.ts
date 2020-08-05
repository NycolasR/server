import knex from "knex";
import path from "path"; // Módulo integrado dentro do node

// migrations: controlam a versão do banco de dados

const database = knex({
  client: "sqlite3",
  connection: {
    // Onde dentro do projeto vai ficar armazenado o banco sqlite
    filename: path.resolve(__dirname, "database.sqlite"),
    // __dirname: diretório onde este arquivo se encontra
  },
  // Quando não for possível definir qual o conteúdo padrão, ele usará null
  useNullAsDefault: true,
});

export default database;
