import * as URL from "./url_helper"
import backend_api_helper from "./backend_api_helper.ts";

export const register = (data: any) => {
    return backend_api_helper.post(URL.REGISTER, data);
}

export const login = (data: any) => {
    return backend_api_helper.post(URL.LOGIN, data);
}

export const refresh = (data: any) => {
    return backend_api_helper.post(URL.REFRESH, data);
}

export const validate = () => {
    return backend_api_helper.post(URL.VALIDATE);
}
export const getUsers = () => {
    return backend_api_helper.get(URL.GET_USERS);
}

export const getGroups = (data: any) => {

    return backend_api_helper.post(URL.GET_GROUPS, data);
}
