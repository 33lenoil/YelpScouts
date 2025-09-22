import axios from 'axios';

const config = require('../config.json');

/**
 * A function to register a new user
 * @param {*} username: a string containing the username
 * @param {*} password: a string containing the password
 */
export default async function register(username, password) {
    try {
        const response = await axios.post(`http://${config['server_host']}:${config['server_port']}/registerUser`, {
            username,
            password,
        });
        return response;
    } catch (e) {
        // error
        console.log('Register error: ', e);
        return null;
    }

    // return {
    //     data: {},

    //     status: 201,

    //     statusText: 'Created',

    //     headers: {},

    //     config: {},

    //     request: {}
    // };
}