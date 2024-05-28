import { pool } from "../db.js"
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config()

export const getAllAdvisors = async (req, res) => {
    try {
        const { userId } = req


        // Verificar que el usuario sea de tipo admin
        const [users] = await pool.query('SELECT * FROM advisors WHERE id = ?', [userId]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid user id' });
        }

        const user = users[0];
        if (user.user_type !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Obtener todos los asesores
        const [advisors] = await pool.query('SELECT * FROM advisors');

        res.send(advisors);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while getting the advisors' });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Comprobar que todos los datos estén completos
        if (!username || !password) {
            return res.status(400).send({ error: 'Missing username or password' });
        }

        const [users] = await pool.query('SELECT * FROM advisors WHERE username = ?', [username]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid username or password' });
        }

        // Obtener la contraseña hasheada del usuario
        const user = users[0];
        const hashedPassword = user.password;

        // Comparar la contraseña proporcionada con la contraseña hasheada
        const correctPassword = await bcryptjs.compare(password, hashedPassword);

        if (!correctPassword) {
            return res.status(400).send({ error: 'Invalid username or password' });
        }

        const userForToken = {
            id: user.id,
            username: user.username,
            userType: user.user_type
        }

        const token = jsonwebtoken.sign(
            { userForToken },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.send({
            status: "ok",
            message: "logged in successfully",
            token: token,
        });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred during login' });
    }
}

export const registerUser = async (req, res) => {
    try {
        const { username, password, userType } = req.body;

        // Verificar que el tipo de usuario sea válido
        if (!['admin', 'advisor'].includes(userType)) {
            return res.status(400).send({ error: 'Invalid user type' });
        }

        const { userId } = req

        // Verificar que el usuario sea de tipo admin
        const [users] = await pool.query('SELECT * FROM advisors WHERE id = ?', [userId]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid user id' });
        }

        const user = users[0];
        if (user.user_type !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Comprobar que todos los datos estén completos
        if (!username || !password) {
            return res.status(400).send({ error: 'invalid username or password' });
        }

        // Comprobar que el usuario sea inexistente
        const [existingUsers] = await pool.query('SELECT * FROM advisors WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).send({ error: 'Username already exists' });
        }

        const salt = await bcryptjs.genSalt()
        const hashPassword = await bcryptjs.hash(password, salt)

        const [rows] = await pool.query('INSERT INTO advisors (username, password, user_type) VALUES (?, ?, ?)', [username, hashPassword, userType]);

        // Obtener el ID del nuevo asesor
        const newUserId = rows.insertId;

        // Obtener toda la información del nuevo asesor registrado
        const [newUser] = await pool.query('SELECT * FROM advisors WHERE id = ?', [newUserId]);

        // Verificar que se haya encontrado el nuevo asesor
        if (newUser.length > 0) {
            const newAdvisor = newUser[0];
            res.status(200).send(newAdvisor);
        } else {
            res.status(404).send({ error: 'advisor registered not found' });
        }
    } catch (error) {
        res.status(500).send({ error: `An error occurred while registering the ${userType}` });
    }
}

export const updateAdvisors = async (req, res) => {
    try {
        const { id } = req.params;
        let { username, password, user_type } = req.body;

        const { userId } = req

        // Verificar que el usuario sea de tipo admin
        const [users] = await pool.query('SELECT * FROM advisors WHERE id = ?', [userId]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid user id' });
        }

        const user = users[0];
        if (user.user_type !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Si se proporciona una nueva contraseña, encriptarla antes de guardarla
        if (password) {
            const salt = await bcryptjs.genSalt()
            password = await bcryptjs.hash(password, salt)
        }

        // Actualizar los detalles del asesor
        const [result] = await pool.query('UPDATE advisors SET username = IFNULL(?, username), password = IFNULL(?, password), user_type = IFNULL(?, user_type) WHERE id = ?', [username, password, user_type, id]);
        if (result.affectedRows === 0) return res.status(404).json({
            message: 'Advisor not found'
        })

        const [rows] = await pool.query('SELECT * FROM advisors WHERE id = ?', [id])
        res.json(rows[0]);

    } catch (error) {
        res.status(500).send({ error: 'An error occurred while updating the advisor' });
    }
}


export const deleteAdvisors = async (req, res) => {
    try {
        const { userId } = req

        // Verificar que el usuario sea de tipo admin
        const [users] = await pool.query('SELECT * FROM advisors WHERE id = ?', [userId]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid user id' });
        }

        const user = users[0];
        if (user.user_type !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Eliminar el asesor
        const [result] = await pool.query('DELETE FROM advisors WHERE id = ?', [req.params.id]);

        if (result.affectedRows <= 0) return res.status(404).json({
            message: 'Advisor not found'
        });

        res.sendStatus(204);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while deleting the advisor' });
    }
}

export const verify = async (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    try {
        jsonwebtoken.verify(token, process.env.JWT_SECRET);
        return res.send({ valid: true });
    } catch (e) {
        return res.send({ valid: false });
    }
};