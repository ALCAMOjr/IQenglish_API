import {createPool} from 'mysql2/promise'
import dotenv from 'dotenv'


dotenv.config()

const { PASSWORD_DATABASE, USER_DATABASE, HOST_DATABASE, DATABASE, DATABASE_TEST, NODE_ENV, DB_PORT } = process.env

console.log("Port", DB_PORT)
console.log()
const databseString = NODE_ENV === 'test'
   ? DATABASE_TEST
   : DATABASE

let pool;

try {
    pool = createPool({
        port: DB_PORT,
        host: HOST_DATABASE,
        user: USER_DATABASE,
        password: PASSWORD_DATABASE,
        database: databseString
    })
} catch (error) {
    process.exit(1); // Termina el proceso con un código de error
}

export { pool };

