import React, { useState, useEffect, useCallback } from 'react';
import API from "../utils/api";
import Menu from '../components/Menu';

const PermissionList = () => {
    const [permissions, setPermissions] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const getPermissions = useCallback(async () => {
        try {
            const { data } = await API.get('/permissions/');
            if (data && data.results) {
                setPermissions(data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar permissões:", error);
        }
    }, []);

    const getUsuarios = useCallback(async () => {
        try {
            const { data } = await API.get('/usuarios/');
            if (data && data.results) {
                setUsuarios(data.results);
            }
        } catch (error) {
            console.error("Erro ao carregar usuarios:", error);
        }
    }, []);

    const getUserPermissions = useCallback(async (userId) => {
        try {
            const { data } = await API.get(`/user/${userId}/permissions/`);
            if (data) {
                setUserPermissions(data);
            }
        } catch (error) {
            console.error("Erro ao carregar permissões do usuário:", error);
        }
    }, []);

    const handleUserChange = (event) => {
        const userId = event.target.value;
        setSelectedUser(userId);
        setUserPermissions([]);
        setSelectedPermissions([]);
        getUserPermissions(userId);
    };

    const handlePermissionSelect = (permissionId) => {
        setSelectedPermissions(prevSelected =>
            prevSelected.includes(permissionId)
                ? prevSelected.filter(id => id !== permissionId)
                : [...prevSelected, permissionId]
        );
    };

    const updateUserPermissions = async () => {
        try {
            await API.post(`/user/${selectedUser}/permissions/update/`, {
                permissions: selectedPermissions
            });
            alert("Permissões atualizadas com sucesso!");
            getUserPermissions(selectedUser);
        } catch (error) {
            console.error("Erro ao atualizar permissões do usuário:", error);
            alert("Erro ao atualizar permissões.");
        }
    };

    useEffect(() => {
        getPermissions();
        getUsuarios();
    }, [getPermissions, getUsuarios]);

    return (
        <div className="mx-auto ">
            <Menu/>
            <h1 className="text-2xl font-bold mb-4">Selecione um Usuário</h1>
            <select 
                onChange={handleUserChange} 
                value={selectedUser || ''} 
                className="w-full p-2 mb-6 border border-gray-300 rounded-lg"
            >
                <option value="">Selecione um usuário</option>
                {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                        {usuario.username}
                    </option>
                ))}
            </select>

            {selectedUser && (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Permissões do Usuário</h2>
                        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            <ul className="space-y-2">
                                {userPermissions.map(permission => (
                                    <li key={permission.id} className="p-2 border-b border-gray-200">
                                        {permission.codename} | {permission.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Todas as Permissões</h2>
                        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            <ul className="space-y-2">
                                {permissions.map(permission => (
                                    <li key={permission.id} className="flex items-center p-2 border-b border-gray-200">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => handlePermissionSelect(permission.id)}
                                                className="form-checkbox text-blue-500"
                                            />
                                            <span>{permission.codename} | {permission.name}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button 
                        onClick={updateUserPermissions} 
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Atualizar Permissões
                    </button>
                </>
            )}
        </div>
    );
};

export default PermissionList;
