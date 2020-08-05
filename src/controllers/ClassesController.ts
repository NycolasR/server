import { Request, Response } from "express";

import database from "../database/connection";
import convertHourToMinutes from "../utils/convertHourToMinutes";

// Usa-se uma interface para definir o formato do objeto
interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    // Se o usuário não informou
    // o dia da semana ou a matéria ou as horas
    // (filtros para listagem), um erro deve ser retornado.
    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: "Missing filters to search classes",
      });
    }

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    const timeInMinutes = convertHourToMinutes(time);

    // Recuperando as classes filtrando com o where
    const classes = await database("classes")
      // Para verificar as compatibilidades de dia e hora requisitados com os disponíveis
      .whereExists(function () {
        this.select("class_schedule.*")
          .from("class_schedule") // Selecionando todos os items de class_schedule
          .whereRaw("`class_schedule`.`class_id` = `classes`.`id`") // Onde os IDs de classes forem iguais aos presentes na tabela classes
          .whereRaw("`class_schedule`.`week_day` = ??", [Number(week_day)]) // E o dia da semana da requisição estiver presente nesta class_schedule
          .whereRaw("`class_schedule`.`from` <= ??", [timeInMinutes]) // E a hora de início especificada estiver após (maior) que a marcada na class_schedule
          .whereRaw("`class_schedule`.`to` > ??", [timeInMinutes]); // E a hora de início especificada estiver antes (menor) que a marcada na class_schedule
      })
      // Verifica se classes.subject é igual (2º parâmetro) a filters.subject
      .where("classes.subject", "=", subject)
      // Join na tabela users onde o ID do usuário presente na
      //tabela classes é igual ao ID presente na tablela users
      .join("users", "classes.user_id", "=", "user_id")
      // Selecionando todos os dados da tabela classes e todos dos dados da tabela users
      .select(["classes.*", "users.*"]);

    return response.json(classes);
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    } = request.body;

    // Ao executar este método, pode ser que uma das operações no banco
    // de dados falhe enquanto outras dão certo.
    // O mais recomendado é que as operações que deram certo também
    // sejam desfeitas.
    // Para isto, usamos transaction:
    const trx = await database.transaction();

    try {
      const insertedUsersIDs = await trx("users").insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      // O await database("").insert retorna uma lista
      // dos IDs dos usuários cadastrados (acima, só há um
      // usuário sendo cadastrado); logo, é possível recuperar
      // o ID doo usuário recém-criado.
      const user_id = insertedUsersIDs[0];

      const insertedClassesIDs = await trx("classes").insert({
        subject,
        cost,
        user_id,
      });

      const class_id = insertedClassesIDs[0];

      // Ao usar typescript, ele não sabe qual o formato (tipo) desta variável
      // É preciso explicitar usando uma interface.
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          // É preciso recuperar os horários e convertê-los para Number
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      await trx("class_schedule").insert(classSchedule);

      // Neste momento, ele realiza as alterações no banco de dados se todas as operações
      // foram bem sucedidas.
      await trx.commit();

      return response.status(201).send();
    } catch (err) {
      // Para defazer qualquer alteração feita no banco de dados
      await trx.rollback();

      console.error(err);

      return response.status(400).json({
        error: "Unexpected error while crating new class",
      });
    }
  }
}
