import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

// Connect to database
connectDB();

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
});
