import { NavLink } from 'react-router-dom';

const CoachSidebar = () => {
    return (
        <nav className="w-64 bg-gray-100 dark:bg-gray-800 min-h-screen p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-6">Coach Panel</h2>
            <ul className="flex flex-col gap-3">
                <li>
                    <NavLink
                        to="/coach/dashboard"
                        className={({ isActive }) =>
                            isActive ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'
                        }
                    >
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/coach/my-videos"
                        className={({ isActive }) =>
                            isActive ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'
                        }
                    >
                        My Videos
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/coach/profile"
                        className={({ isActive }) =>
                            isActive ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'
                        }
                    >
                        Profile
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default CoachSidebar;
