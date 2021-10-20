import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express(); // Declarando uma variável app chamando uma função

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(3333);
console.log('Server is running at port 3333');