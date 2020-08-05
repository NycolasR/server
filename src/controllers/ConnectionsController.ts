import { Request, Response } from "express";
import database from "../database/connection";

export default class ConnectionsController {
  async index(request: Request, response: Response) {
    // O retorno será um array
    // Recuperará todas as conexões e vai retornar isso em uma coluna chamada total
    const totalConnections = await database("connections").count("* as total");

    // Primeiro elemento do array
    const { total } = totalConnections[0];

    return response.json({ total });
  }

  async create(request: Request, response: Response) {
    const { user_id } = request.body;

    await database("connections").insert({
      user_id,
    });

    return response.status(201).send();
  }
}
