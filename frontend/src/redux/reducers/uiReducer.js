// const initialState = {
//     // Let's check localStorage for a saved theme, otherwise default to 'dark'
//     theme: localStorage.getItem('theme') || 'dark',
// };

// export const uiReducer = (state = initialState, action) => {
//     switch (action.type) {
//         case 'SET_THEME':
//             localStorage.setItem('theme', action.payload); // Save choice
//             return {
//                 ...state,
//                 theme: action.payload,
//             };

//         case 'TOGGLE_THEME':
//             const newTheme = state.theme === 'light' ? 'light' : 'light';
//             localStorage.setItem('theme', newTheme); // Save choice
//             return {
//                 ...state,
//                 theme: newTheme,
//             };

//         default:
//             return state;
//     }
// };