import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import DataTable, { ActionMenu, StatusBadge } from '../../../../components/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import EditUserForm from './EditUserForm';
import SidePanel from '../../../../components/ui/SidePanel';
import axios from "axios";
const APIURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- Page Component ---
const UsersPage = () => {

    const navigate = useNavigate();

    // --- State for the Side Panel ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // --- Fetch users on mount ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    `${APIURL}/api/users/get-users`
                );
                setUsers(response.data); // Assuming API returns an array of users
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);


    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await axios.delete(`${APIURL}/api/users/delete-user/${userId}`);
            console.log(response, "delete resposne")
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            alert("User deleted successfully!");
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete user.");
        }
    };

    // --- Handlers for opening/closing the panel ---
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedUser(null);
    };

    // --- Column Definitions ---
    const columns = [
        {
            header: "Sr. No.",
            accessor: "srno",
            cell: (_, index) => (
                <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {index + 1}
                </div>
            ),
        },
        {
            header: 'Name',
            accessor: 'name',
            sortable: true,
            cell: (row) => (
                <div className="flex items-center">
                    <div className="font-medium text-gray-800 dark:text-gray-100">{row.name}</div>
                </div>
            ),
        },
        {
            header: 'Email',
            accessor: 'email',
            sortable: true,
        },
        {
            header: 'Role',
            accessor: 'role',
            sortable: true,
            cell: (row) => (
                <StatusBadge
                    status={row.role}
                    colorMap={{
                        admin: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
                        editor: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300',
                        viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-600/30 dark:text-gray-400',
                    }}
                />
            )
        },
    ];

    // --- Action Renderer ---
    const renderActions = (user) => (
        <div className="flex items-center justify-center gap-2">
            {/* View */}
            {/* <button
                onClick={() => handleView(user)}
                className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                title="View User"
            >
                <Eye className="text-blue-600 dark:text-blue-400" size={18} />
            </button> */}

            {/* Edit */}
            <button
                onClick={() => handleEditUser(user)}
                className="p-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900 transition"
                title="Edit User"
            >
                <Edit className="text-yellow-600 dark:text-yellow-400" size={18} />
            </button>

            {/* Delete */}
            <button
                onClick={() => handleDeleteUser(user)}
                className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition"
                title="Delete User"
            >
                <Trash2 className="text-red-600 dark:text-red-400" size={18} />
            </button>
        </div>
    );

    const createUserButton = {
        label: '+ Create User',
        onClick: () => navigate('/create-user'),
    };

    return (
        <>
            <DataTable
                title="Manage Users"
                columns={columns}
                data={users}
                renderActions={renderActions}
                loading={loading}
                headerButton={createUserButton}
            />

            <SidePanel title="Edit User Details" isOpen={isPanelOpen} onClose={handleClosePanel}>
                {selectedUser && <EditUserForm user={selectedUser} onClose={handleClosePanel} />}
            </SidePanel>
        </>
    );
};



export default UsersPage;
