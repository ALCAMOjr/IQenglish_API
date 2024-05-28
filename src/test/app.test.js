import supertest from "supertest"
import { server, app } from "../index.js"
import dotenv from 'dotenv'
import { testinitializeAdmin } from './helpers.js'
import { pool } from "../db.js"
import { DeleteAllAdvisors, testinitializeAndLoginAdvisor, DeleteAllProspects } from "./helpers.js"
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env
dotenv.config()

const api = supertest(app);

let tokenAdmin;
let tokenAdvisor;
let advisorCredentials;
let adminCredentials;

const newProspect = {
    name: 'Test Name',
    lastname: 'Test Lastname',
    email: 'test@example.com',
    phone_number: '1234567890',
    age: 30,
    address: 'Otro lugar'
};

const updatedProspect = {
    name: 'Updated Name',
    lastname: 'Updated Lastname',
    email: 'updated@example.com',
    phone_number: '0987654321',
    age: 35,
    address: 'Otro lugar'
};


beforeAll(async () => {
    await testinitializeAdmin();

    tokenAdvisor = await testinitializeAndLoginAdvisor()

    await DeleteAllAdvisors()

    await DeleteAllProspects()

});



describe('Admin operations', () => {

    test('Admin login', async () => {
        const response = await api
            .post('/api/advisors/login')
            .send({
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD
            })
            .expect(200)
        tokenAdmin = response.body.token; // Guardar el token para su uso en pruebas posteriores
    });


    test('Login admin fails with incorrect credentials', async () => {
        const incorrectCredentials = {
            username: 'incorrectUsername',
            password: 'incorrectPassword',
        };

        await api
            .post('/api/advisors/login')
            .send(incorrectCredentials)
            .expect(400) // Esperar un código de estado 401 (No autorizado)
    });



    test('A new Admin is successfully registered', async () => {
        const timestamp = Date.now();
        adminCredentials = {
            username: 'newadmin' + timestamp, // Añadir el timestamp al nombre de usuario
            password: 'password',
        };
        const newUser = {
            ...adminCredentials,
            userType: 'admin'
        };

        const response = await api
            .post('/api/advisors/register')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(newUser)
            .expect(200)

        adminCredentials.id = response.body.id; // Guardar el ID del administrador
    });

    test('A new administrator has failed to register without complete credentials.', async () => {
        const timestamp = Date.now();
        const incompleteAdminCredentials = {
            username: 'newadmin' + timestamp, // Añadir el timestamp al nombre de usuario
        };
        const newUser = {
            ...incompleteAdminCredentials,
            userType: 'admin'
        };

        await api
            .post('/api/advisors/register')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(newUser)
            .expect(400)
    });

    test('Update admin', async () => {
        const updatedCredentials = {
            username: "UpdateAdmin", // Cambiar el nombre de usuario
            password: 'newPassword', // Cambiar la contraseña
        };
        await api
            .patch(`/api/advisors/${adminCredentials.id}`) // Usar el ID del administrador
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(updatedCredentials)
            .expect(200)
    });

    test('Admin can login with new credentials', async () => {
        const updatedCredentials = {
            username: "UpdateAdmin", // Usar el nuevo nombre de usuario
            password: 'newPassword', // Usar la nueva contraseña
        };

        await api
            .post('/api/advisors/login')
            .send(updatedCredentials)
            .expect(200)
    });

    test('Delete admin', async () => {
        await api
            .delete(`/api/advisors/${adminCredentials.id}`) // Usar el ID del administrador
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .expect(204)
    });

    test('Deleted admin cannot login', async () => {
        await api
            .post('/api/advisors/login')
            .send(adminCredentials)
            .expect(400) // Esperar un código de estado 400 (Solicitud incorrecta)
    });

});


describe('First GetAllAdvisors:', () => {
    test('Get all advisors', async () => {
        const response = await api
            .get('/api/advisors')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(2); // Verificar que la cantidad de asesores sea 2
    });

})

describe('Advisor operations', () => {

    test('A new Advisor is successfully registered', async () => {
        const timestamp = Date.now();
        advisorCredentials = {
            username: 'newadvisor' + timestamp, // Añadir el timestamp al nombre de usuario
            password: 'password',
        };
        const newUser = {
            ...advisorCredentials,
            userType: 'advisor'
        };

        const response = await api
            .post('/api/advisors/register')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(newUser)
            .expect(200)

        advisorCredentials.id = response.body.id; // Guardar el ID del asesor
    });



    test('A new advisor has failed to register without complete credentials.', async () => {
        const timestamp = Date.now();
        const incompleteAdvisorCredentials = {
            username: 'newadvisor' + timestamp, // Añadir el timestamp al nombre de usuario
        };
        const newUser = {
            ...incompleteAdvisorCredentials,
            userType: 'advisor'
        };

        await api
            .post('/api/advisors/register')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(newUser)
            .expect(400)
    });


    test('Advisor login', async () => {
        await api
            .post('/api/advisors/login')
            .send(advisorCredentials)
            .expect(200)

    });

    test('Login advisors fails with incorrect credentials', async () => {
        const incorrectCredentials = {
            username: 'incorrectUsername',
            password: 'incorrectPassword',
        };

        await api
            .post('/api/advisors/login')
            .send(incorrectCredentials)
            .expect(400) // Esperar un código de estado 401 (No autorizado)
    });

    test('Update advisor', async () => {
        const updatedCredentials = {
            username: "UpdateAdvisor", // Usar el mismo nombre de usuario
            password: 'newPassword', // Cambiar la contraseña
        };
        await api
            .patch(`/api/advisors/${advisorCredentials.id}`) // Usar el ID del asesor
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .send(updatedCredentials)
            .expect(200)
    });

    test('Advisor can login with new credentials', async () => {
        const updatedCredentials = {
            username: "UpdateAdvisor", // Usar el mismo nombre de usuario
            password: 'newPassword', // Usar la nueva contraseña
        };

        await api
            .post('/api/advisors/login')
            .send(updatedCredentials)
            .expect(200)
    });

    test('Delete advisor', async () => {
        await api
            .delete(`/api/advisors/${advisorCredentials.id}`) // Usar el ID del asesor
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .expect(204)
    });


    test('Deleted advisor cannot login', async () => {
        await api
            .post('/api/advisors/login')
            .send(advisorCredentials)
            .expect(400) // Esperar un código de estado 400 (Solicitud incorrecta)
    });


});


describe('Second GetAllAdvisors:', () => {
    test('Get all advisors', async () => {
        const response = await api
            .get('/api/advisors')
            .set('Authorization', `Bearer ${tokenAdmin}`) // Usar el token para autenticar la solicitud
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(2); // Verificar que la cantidad de asesores sea 2
    });

})



describe('Prospects:', () => {
    let newProspectId;

    test('Create prospect', async () => {
        const response = await api
            .post('/api/prospects')
            .set('Authorization', `Bearer ${tokenAdvisor}`) // Usar el token del asesor para autenticar la solicitud
            .send(newProspect)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        newProspectId = response.body.id; // Guardar el ID del nuevo prospecto para usarlo en las siguientes pruebas

        expect(response.body.name).toBe(newProspect.name); // Verificar que el nombre del prospecto creado sea el correcto
    });

    test('Get all prospects', async () => {
        const response = await api
            .get('/api/prospects')
            .set('Authorization', `Bearer ${tokenAdvisor}`) // Usar el token del asesor para autenticar la solicitud
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const prospects = response.body;
        const newProspect = prospects.find(prospect => prospect.id === newProspectId); // Buscar el nuevo prospecto en la lista de prospectos

        expect(newProspect).toBeDefined(); // Verificar que el nuevo prospecto esté en la lista de prospectos
    });

    test('Get prospect by id', async () => {
        const response = await api
            .get(`/api/prospects/${newProspectId}`)
            .set('Authorization', `Bearer ${tokenAdvisor}`) // Usar el token del asesor para autenticar la solicitud
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const prospect = response.body;

        expect(prospect).toBeDefined(); // Verificar que el prospecto exista
        expect(prospect.id).toBe(newProspectId); // Verificar que el ID del prospecto sea el correcto
    });

    test('Update prospect', async () => {
        await api
            .patch(`/api/prospects/${newProspectId}`)
            .set('Authorization', `Bearer ${tokenAdvisor}`) // Usar el token del asesor para autenticar la solicitud
            .send(updatedProspect)
            .expect(200);

        const response = await api
            .get(`/api/prospects/${newProspectId}`)
            .set('Authorization', `Bearer ${tokenAdvisor}`); // Usar el token del asesor para autenticar la solicitud

        const prospect = response.body;

        expect(prospect.name).toBe(updatedProspect.name);
        expect(prospect.lastname).toBe(updatedProspect.lastname);
        expect(prospect.email).toBe(updatedProspect.email);
        expect(prospect.phone_number).toBe(updatedProspect.phone_number);
        expect(prospect.age).toBe(updatedProspect.age);
        expect(prospect.addresses).toBe(updatedProspect.address);
    });

    test('Delete prospect', async () => {
        await api
            .delete(`/api/prospects/${newProspectId}`)
            .set('Authorization', `Bearer ${tokenAdvisor}`) // Usar el token del asesor para autenticar la solicitud
            .expect(204);

        const response = await api
            .get(`/api/prospects/${newProspectId}`)
            .set('Authorization', `Bearer ${tokenAdvisor}`); // Usar el token del asesor para autenticar la solicitud

        expect(response.status).toBe(404);
    });


});




afterAll(async () => {

    server.close()
    pool.end()




})