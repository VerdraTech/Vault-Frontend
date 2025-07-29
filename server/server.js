const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/supabase', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseApiKey: process.env.SUPABASE_API_KEY
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
