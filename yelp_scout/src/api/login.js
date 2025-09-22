import axios from 'axios';

const config = require('../config.json');

/**
 * A function to log in a user
 * @param {*} username: a string containing the username
 * @param {*} password: a string containing the password
 */
export default async function login(username, password) {
    try {
        const response = await axios.post(`http://${config['server_host']}:${config['server_port']}/loginUser`, {
            username,
            password,
        });
        return response;
    } catch (e) {
        // error
        console.log('Login error: ', e);
        return null;
    }

    // return {
    //     data: {
    //         userId: "1"
    //     },

    //     status: 200,

    //     statusText: 'OK',

    //     headers: {},

    //     config: {},

    //     request: {}
    // };
}