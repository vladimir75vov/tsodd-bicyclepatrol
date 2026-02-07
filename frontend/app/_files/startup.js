import { spawn } from "node:child_process";

// Скрипт запуска frontend сервера с автоматическим освобождением порта
const getCommand = () => {
  const port = 3000;
  return `npx kill-port --port ${port} && next dev --port ${port}`;
};

const ls = spawn("cmd", ["/C", getCommand()]);

ls.stdout.on("data", (data) => {
  console.log(data.toString());
});
