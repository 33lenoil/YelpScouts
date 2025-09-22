import axios from 'axios';

const config = require('../config.json');

/**
 * A function to search for businesses
 * @param {*} userId: a string containing the user ID
 * @param {*} name: a string representing the business name
 * @param {*} city: a string representing the city
 * @param {*} state: a string representing the state
 * @param {*} postal_code: a string representing the zip code
 * @param {*} stars_low: a number representing the minimum star
 * @param {*} stars_high: a number representing the maximum sta
 * @param {*} category: a string representing the category of the business
 * @param {*} page: a number representing the page number
 * @param {*} pageSize: a number representing the page size
 */
export default async function businessSearch(userId, name, city, state, postal_code, stars_low, stars_high, category, page, pageSize) {
    console.log("in business search");
    console.log(stars_low);
    console.log(stars_high);
    try {
        const response = await axios.post(`http://${config['server_host']}:${config['server_port']}/businessSearch?page=${page}&page_size=${pageSize}`, {
            userId,
            name,
            city,
            state,
            postal_code,
            stars_low,
            stars_high,
            category
        });
        return response;
    } catch (e) {
        // error
        console.log('Business search error: ', e);
        return null;
    }

    // return {
    //     data: {
    //         businesses: [
    //             {
    //                 businessId: "1",
    //                 name: "Shake Shack",
    //                 address: "123 Main St",
    //                 city: "San Francisco",
    //                 stars: 4.5,
    //                 category: "Restaurant"
    //             }, 
    //             {
    //                 businessId: "2",
    //                 name: "McDonalds",
    //                 address: "456 Main St",
    //                 city: "San Francisco",
    //                 stars: 3.5,
    //                 category: "Restaurant"
    //             },
    //             {
    //                 businessId: "3",
    //                 name: "Starbucks",
    //                 address: "789 Main St",
    //                 city: "San Francisco",
    //                 stars: 4.0,
    //                 category: "Coffee Shop"
    //             },
    //             {
    //                 businessId: "4",
    //                 name: "Wendy's",
    //                 address: "321 Main St",
    //                 city: "San Francisco",
    //                 stars: 3.0,
    //                 category: "Restaurant"
    //             },
    //             {
    //                 businessId: "5",
    //                 name: "Taco Bell",
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