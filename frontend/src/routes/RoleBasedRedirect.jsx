import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'COACH') return <Navigate to="/coach/dashboard" replace />;

    return <Navigate to="/login" replace />;
};

export default RoleBasedRedirect;
