import mongoose from 'mongoose'
import chalk from 'chalk'
import { DEVELOPMENT, TESTING, LOCAL, PRODUCTION } from './envTypes.js'


async function DB(){
let DB_URL;
switch (process.env.NODE_ENV) {
  case DEVELOPMENT:
    DB_URL = process.env.DB_URL_DEV;
    break;
  case PRODUCTION:
    DB_URL = process.env.DB_URL_PROD;
    break;
  case LOCAL:
    DB_URL = process.env.DB_URL_LOC;
    break;
  case TESTING:
    DB_URL = process.env.DB_URL_TEST;
    break;
  default:
    DB_URL = process.env.DB_URL;
}
    console.log(chalk.blue('Connecting to DB using...' + process.env.NODE_ENV + ' environment'))
    return mongoose.connect(DB_URL)
}

export default DB