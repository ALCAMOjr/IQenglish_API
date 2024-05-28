import { pool } from "./db.js"
import bcryptjs from 'bcryptjs'

export const initializeAdmin = async () => {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Comprobar si ya existe un usuario administrador
    const [users] = await pool.query('SELECT * FROM advisors WHERE username = ? AND user_type = ?', [adminUsername, 'admin']);
    if (users.length > 0) {
        return;
    }
    const salt = await bcryptjs.genSalt()
    const hashPassword = await bcryptjs.hash(adminPassword, salt)

    await pool.query('INSERT INTO advisors (username, password, user_type) VALUES (?, ?, ?)', [adminUsername, hashPassword, 'admin']);

}




