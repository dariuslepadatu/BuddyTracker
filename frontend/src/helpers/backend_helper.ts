import * as URL from "./url_helper"
import backend_api_helper from "./backend_api_helper.ts";
import {GET_USERS} from "./url_helper";

export const register = (data: any) => {
    return backend_api_helper.post(URL.REGISTER, data);
}

export const login = (data: any) => {
    return backend_api_helper.post(URL.LOGIN, data);
}

export const refresh = (data: any) => {
    return backend_api_helper.post(URL.REFRESH, data);
}

export const validate = (data: any) => {
    return backend_api_helper.post(URL.VALIDATE, data);
}
export const getUsers = () => {
    return backend_api_helper.get(URL.GET_USERS);
}
