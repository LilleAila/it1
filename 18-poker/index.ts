import { migrate } from "./src/migrate";
import { httpServer } from "./src/server";
import { initPokerServer } from "./src/pokerServer";
import { initStats } from "./src/statistics";

migrate();

const PORT = 3000;

function init() {
  initPokerServer();
  initStats();
  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

init();
