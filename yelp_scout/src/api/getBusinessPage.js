import axios from 'axios';

const config = require('../config.json');

/**
 * A function to search for business by its id
 * @param {*} userId: a string containing the user ID
 * @param {*} businessId: a string representing the business id
 */

export default async function getBusinessPage(userId, businessId, highlightedKeyword) {
    try {
        const response = await axios.get(`http://${config['server_host']}:${config['server_port']}/business/${businessId}`, {
            params: {
                highlightedKeyword: highlightedKeyword
            }
        });
        return response;
    } catch (e) {
        // error
        console.log('Get business page error: ', e);
        return null;
    }

}