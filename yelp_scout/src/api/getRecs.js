import axios from 'axios';

const config = require('../config.json');

/**
 * A function to get business recommendations
 * @param {*} userId: a string containing the user ID
 * @param {*} page: a number representing the page number
 * @param {*} pageSize: a number representing the page size
 */
export default async function businessRec(userId, page, pageSize) {
    console.log("in business rec");
    try {
        const response = await axios.post(`http://${config['server_host']}:${config['server_port']}/businessRec?page=${page}&page_size=${pageSize}`, {
            userId
        });
        return response;
    } catch (e) {
        // error
        console.log('Business recommendation error: ', e);
        return null;
    }

    // return {
    //     data: {
    //         businesses: [
    //             {
    //                 businessId: "1",
    //                 name: "Chick-fil-A",
    //                 address: "123 Main St",
    //                 city: "San Francisco",
    //                 stars: 4.5,
    //                 category: "Restaurant"
    //             }, 
    //             {
    //                 businessId: "2",
    //                 name: "KFC",
    //                 address: "456 Main St",
    //                 city: "San Francisco",
    //                 stars: 3.5,
    //                 category: "Restaurant"
    //             },
    //             {
    //                 businessId: "3",
    //                 name: "Black Coffee Shop",
    //                 address: "789 Main St",
    //                 city: "San Francisco",
    //                 stars: 4.0,
    //                 category: "Coffee Shop"
    //             },
    //             {
    //                 businessId: "4",
    //                 name: "Chat Thai",
    //                 address: "321 Main St",
    //                 city: "San Francisco",
    //                 stars: 3.0,
    //                 category: "Restaurant"
    //             },
    //             {
    //                 businessId: "5",
    //                 name: "Highway House",
    //                 address: "654 Main St",
    //                 city: "San Francisco",
    //                 stars: 4.0,
    //                 category: "Restaurant"
    //             }
    //         ],
    //     },

    //     status: 200,

    //     statusText: 'OK',

    //     headers: {},

    //     config: {},

    //     request: {}
    // };
}