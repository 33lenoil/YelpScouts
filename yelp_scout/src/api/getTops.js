import axios from 'axios';

const config = require('../config.json');

/**
 * A function to get the top businesses
 */
export default async function topBusinesses(page, pageSize) {
    console.log("in top business");
    try {
        const response = await axios.get(`http://${config['server_host']}:${config['server_port']}/global_business_rankings?page=${page}&page_size=${pageSize}`);
        return response;
    } catch (e) {
        // error
        console.log('Business ranking error: ', e);
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