import React, { useState, useEffect, useCallback, useContext } from 'react';
import API from '../utils/api';
import { UserContext } from '../context/UserContext';

const UserCombobox = () => {
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { selectedUser, setSelectedUser } = useContext(UserContext);

    const getUsers = useCallback(async () => {
        try {
            const { data } = await API.get('/clientes/');

            if (data && data.results) {
                setUsers(data.results);
            }
        } catch (error) {
            console.error('Erro ao buscar os usuários:', error);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (!event.target.closest('#combobox-button')) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="col-span-6 sm:col-span-3">
            <label htmlFor="cliente" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Cliente</label>
            <button
                className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                id="combobox-button" aria-expanded={isOpen} aria-haspopup="listbox"
                onClick={toggleDropdown}
            >
                {selectedUser ? selectedUser.NomePessoa : 'Selecione um usuário'}
                <svg className="ml-2 h-5 w-5 text-gray-700 float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            <ul
                className={`absolute z-10 mt-1 w-96 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${isOpen ? '' : 'hidden'}`}
                role="listbox" aria-labelledby="combobox-button" id="combobox-options">
                {users.map((user) => (
                    <li
                        key={user.IdPessoa}
                        className="shadow-sm text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                        onClick={() => handleUserSelect(user)}
                    >
                        <span className="font-normal block truncate">
                            {user.NomePessoa}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserCombobox;
