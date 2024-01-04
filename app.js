// app.js
import express from 'express';
import staffRoutes from './Routes/staffRoute.js'; // Note the added file extension
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('view'));
app.use('/public', express.static(path.join(__dirname, 'public')));
// Define a route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'app.html'));
});

app.use('/api', staffRoutes);

app.listen(PORT, () => {
  console.log(`Staff Service is listening at http://localhost:${PORT}`);
});
