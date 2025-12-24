import axios from "axios";

export const shopchampRestaurantAPI = axios.create({
    baseURL:'https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/',
});


export const shopchampRestaurantTestAPI = axios.create({
    baseURL:'http://localhost:9000/shopchamp-restaurant/asia-southeast2',
});


export const shopchamAPI = axios.create({
    baseURL:'https://asia-southeast2-shopcham-24b0b.cloudfunctions.net/',
});


export const shopchamTestAPI = axios.create({
    baseURL:'http://localhost:9000/shopcham-24b0b/asia-southeast2',
});
