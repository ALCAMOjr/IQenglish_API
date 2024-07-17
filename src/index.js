import { initializeAdmin } from './init.js'
import dotenv from 'dotenv'
import { app } from "./app.js"


dotenv.config()



app.use((req, res, next) => {
    res.status(404).json({
        message: 'endpoint not found'
    })
})

// Inicializar el usuario administrador
if (process.env.NODE_ENV !== 'test') {
    initializeAdmin();
}

const PORT = process.env.PORT || 3001


 const server = app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

export { app, server };
