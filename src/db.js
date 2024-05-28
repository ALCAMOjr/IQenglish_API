import {createPool} from 'mysql2/promise'

const {
  PASSWORD_DATABASE,
  USER_DATABASE,
  HOST_DATABASE,
  DATABASE,
  DATABASE_TEST,
  DB_PORT,
} = process.env;

console.log("PASSWORD_DATABASE:", PASSWORD_DATABASE);
console.log("USER_DATABASE:", USER_DATABASE);
console.log("HOST_DATABAhSE:", HOST_DATABASE);
console.log("DATABASE:", DATABASE);
console.log("DATABASE_TEST:", DATABASE_TEST);
console.log("DB_PORT:", DB_PORT);

const databaseString = DATABASE;

let pool;

try {
  pool = createPool({
    port: DB_PORT,
    host: HOST_DATABASE,
    user: USER_DATABASE,
    password: PASSWORD_DATABASE,
    database: databaseString,
  });
} catch (error) {
  console.error("Failed to create a database connection pool:", error);
  process.exit(1); // Termina el proceso con un código de error
}

export { pool };
