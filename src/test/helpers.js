import { pool } from "../db.js"
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config()


export const DeleteAllAdvisors = async () => {
    // Eliminar todos los usuarios excepto el administrador y el asesor // El nombre de usuario del asesor
    await pool.query('DELETE FROM advisors WHERE username != ? AND username != ?', [process.env.ADMIN_USERNAME, process.env.ADVISOR_USERNAME]);
}


export const testinitializeAdmin = async () => {
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


export const testinitializeAndLoginAdvisor = async () => {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const advisorUsername = process.env.ADVISOR_USERNAME;
    const advisorPassword = process.env.ADVISOR_PASSWORD;

    // Comprobar si ya existe un usuario administrador
    const [adminUsers] = await pool.query('SELECT * FROM advisors WHERE username = ? AND user_type = ?', [adminUsername, 'admin']);
    if (adminUsers.length === 0) {
        const salt = await bcryptjs.genSalt()
        const hashPassword = await bcryptjs.hash(adminPassword, salt)

        await pool.query('INSERT INTO advisors (username, password, user_type) VALUES (?, ?, ?)', [adminUsername, hashPassword, 'admin']);
    }

    // Registrar al asesor
    const [existingAdvisors] = await pool.query('SELECT * FROM advisors WHERE username = ?', [advisorUsername]);
    if (existingAdvisors.length === 0) {
        const salt = await bcryptjs.genSalt()
        const hashPassword = await bcryptjs.hash(advisorPassword, salt)

        await pool.query('INSERT INTO advisors (username, password, user_type) VALUES (?, ?, ?)', [advisorUsername, hashPassword, 'advisor']);
    }

    // Iniciar sesión como asesor
    const [users] = await pool.query('SELECT * FROM advisors WHERE username = ?', [advisorUsername]);
    const user = users[0];
    const hashedPassword = user.password;
    const correctPassword = await bcryptjs.compare(advisorPassword, hashedPassword);

    if (!correctPassword) {
        return;
    }

    const userForToken = {
        id: user.id,
        username: user.username
    }

    const token = jsonwebtoken.sign(
        { userForToken },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    return token;
}

export const DeleteAllProspects = async () => {
    await pool.query('DELETE FROM prospects');
}
