require('dotenv').config(); 
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;



(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`API running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
