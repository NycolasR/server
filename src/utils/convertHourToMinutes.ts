export default function convertHourToMinutes(time: string) {
  // Para horas neste formato: hh:mm

  const [hour, minutes] = time.split(":").map(Number); // Retornando os valores da hora como Number
  const timeInMinutes = hour * 60 + minutes;
  return timeInMinutes;
}
