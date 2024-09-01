import React, { useState, useEffect, useCallback, useContext } from 'react';
import API from '../utils/api';
import { FornContext } from '../context/FornContext';

const FornCombobox = () => {
    const [forns, setForns] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { selectedForn, setSelectedForn } = useContext(FornContext);

    const getForns = useCallback(async () => {
        try {
            const { data } = await API.get('/fornecedores/');

            if (data && data.results) {
                setForns(data.results);
            }
        } catch (error) {
            console.error('Erro ao buscar os fornecedores:', error);
        }
    }, []);

    useEffect(() => {
        getForns();
    }, [getForns]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleFornSelect = (forn) => {
        setSelectedForn(forn);
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
            <label htmlFor="fornecedor" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Fornecedor</label>
            <button
                className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                id="combobox-button" aria-expanded={isOpen} aria-haspopup="listbox"
                onClick={toggleDropdown}
            >
                {selectedForn ? selectedForn.NomeJuridico : 'Selecione um fornecedor'}
                <svg className="ml-2 h-5 w-5 text-gray-700 float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            <ul
                className={`absolute z-10 mt-1 w-96 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${isOpen ? '' : 'hidden'}`}
                role="listbox" aria-labelledby="combobox-button" id="combobox-options">
                {forns.map((forn) => (
                    <li
                        key={forn.IdFornecedor}
                        className="shadow-sm text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                        onClick={() => handleFornSelect(forn)}
                    >
                        <span className="font-normal block truncate">
                            {forn.NomeJuridico}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FornCombobox;
