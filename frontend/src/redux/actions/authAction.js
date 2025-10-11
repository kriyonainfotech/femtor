// Action Types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

/**
 * Action for successful login.
 * In a real app, this would be dispatched by a thunk after an API call.
 * @param {object} userData - The user data from the API, including the role.
 */
export const loginSuccess = (userData) => ({
    type: LOGIN_SUCCESS,
    payload: userData,
});

/**
 * Action for logging out.
 */
export const logout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('authToken');
    return { type: LOGOUT };
};
