import dotenv from "dotenv";
import chalk from "chalk";
import app from "./server/app.js";
import DB from "./server/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

DB()
  .then(() => {
    console.log(chalk.green(`Database connected successfully`));
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(chalk.green(`Server is running on port ${PORT} using ${process.env.NODE_ENV} environment`));
    });
  })
  .catch((err) => {
    console.log(chalk.red(`Database connection failed: ${err}`));
  });

  export default app; // for testing