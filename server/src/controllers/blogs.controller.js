import { pool } from "../db.js";
import dotenv from 'dotenv'


dotenv.config()


export const getBlogs = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Blogs');
        res.json(rows);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while getting the blogs' });
    }
}

export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [id]);
        if (rows.length <= 0) return res.status(404).json({
            message: 'Blog not found'
        });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while getting the blog by id' });
    }
}

export const createBlog = async (req, res) => {
    try {
        const { userId } = req;
        console.log(userId)
        const { foto, fecha, titulo, description } = req.body;

        // Verificar que el usuario sea de tipo admin
        const [users] = await pool.query('SELECT * FROM advisors WHERE id = ?', [userId]);
        if (users.length <= 0) {
            return res.status(400).send({ error: 'Invalid user id' });
        }

        const user = users[0];
        if (user.user_type !== 'admin') {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Verificar que todos los campos requeridos estén presentes
        if (!foto || !fecha || !titulo || !description) {
            return res.status(400).send({ error: 'Missing required fields' });
        }

        const [rows] = await pool.query('INSERT INTO Blogs (foto, fecha, titulo, description) VALUES (?, ?, ?, ?)', [foto, fecha, titulo, description]);

        res.send({
            id: rows.insertId,
            titulo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while creating the blog' });
    }
}


export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { foto, fecha, titulo, description } = req.body;
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

        // Actualizar el blog
        const [result] = await pool.query('UPDATE Blogs SET foto = IFNULL(?, foto), fecha = IFNULL(?, fecha), titulo = IFNULL(?, titulo), description = IFNULL(?, description) WHERE id = ?', [foto, fecha, titulo, description, id]);

        if (result.affectedRows === 0) return res.status(404).json({
            message: 'Blog not found'
        })

        const [rows] = await pool.query('SELECT * FROM Blogs WHERE id = ?', [id])
        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while updating the blog' });
    }
}

export const deleteBlog = async (req, res) => {
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

        // Eliminar el blog
        const [result] = await pool.query('DELETE FROM Blogs WHERE id = ?', [req.params.id]);

        if (result.affectedRows <= 0) return res.status(404).json({
            message: 'Blog not found'
        });
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while deleting the blog' });
    }
};
