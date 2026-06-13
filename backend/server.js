import dns from 'dns'
import dotenv from 'dotenv'
import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDb from "./src/db/db.connect.js";

dns.setServers(['8.8.8.8', '8.8.4.4'])
dotenv.config()
const port = config.PORT || 3000;

async function startServer() {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startServer();
