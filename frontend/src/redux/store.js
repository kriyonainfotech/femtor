import { createStore, combineReducers } from 'redux';
// import { uiReducer } from './reducers/uiReducer';
import authReducer from './reducers/authReducer'

const rootReducer = combineReducers({
    auth: authReducer,
    // ui: uiReducer,
});

const store = createStore(
    rootReducer,
);

export default store;
