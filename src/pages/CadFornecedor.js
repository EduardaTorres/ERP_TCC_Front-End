import Menu from '../components/Menu';
import { useEffect, useState, useCallback } from "react";
import API from "../utils/api";
import Modal from "../components/Modal";
import ModalError from '../components/ModalError';
import InputMask from 'react-input-mask';

function Fornecedor() {

    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState([]);

    const modalErrorOpenModal = () => setModalErrorOpen(true);
    const modalErrorCloseModal = () => setModalErrorOpen(false);

    const [deletModalOpen, setDeletModalOpen] = useState(false);
    const deletOpenModal = () => setDeletModalOpen(true);
    const deletCloseModal = () => setDeletModalOpen(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [forns, setForns] = useState([]);
    const [tot, setTot] = useState([]);
    const [selectedForn, setSelectedForn] = useState(null);
    const [createForn, setCreateForn] = useState(null);

    const [nextPage, setNextPage] = useState();
    const [previousPage, setPreviousPage] = useState();

    const nextItems = async () => {
        try {
            const response = await fetch(`${nextPage}`);
            const data = await response.json();
            setForns(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
            console.log(data.next)
            console.log(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const previousItems = async () => {
        try {
            const response = await fetch(`${previousPage}`);
            const data = await response.json();
            setForns(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const handleFornChange = (fornId) => {
        const forn = forns.find(f => f.IdFornecedor === fornId);
        setSelectedForn(forn);
    };

    const getForns = useCallback(async () => {
        try {
            const { data } = await API.get('/fornecedores/');

            if (data && data.results) {
                setTot(data.count)
                setForns(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            }
        } catch (error) {
            console.error('Erro ao buscar os usuários:', error);
        }
    }, []);

    const addForn = async () => {
        try {
            await API.post('/fornecedor/create/', createForn);
            getForns();
            closeModal();

            setErrorMessage('');
        } catch (error) {
          if (error.response) {
            const errorData = error.response.data;
            
            const errorMessage = JSON.stringify(errorData, null, 2); 
            
            setErrorMessage(errorMessage);
          } else {
            setErrorMessage('Erro ao adicionar o fornecedor. Tente novamente.');
          }
    
          console.error(errorMessage, error);
          modalErrorOpenModal();
        }
    };

    const updateForn = async () => {
        try {
            await API.put(`/fornecedor/update/${selectedForn.IdFornecedor}`, selectedForn);
            getForns();
            closeModal();

            setErrorMessage('');
        } catch (error) {
          if (error.response) {
            const errorData = error.response.data;
            
            const errorMessage = JSON.stringify(errorData, null, 2); 
            
            setErrorMessage(errorMessage);
          } else {
            setErrorMessage('Erro ao editar o fornecedor. Tente novamente.');
          }
    
          console.error(errorMessage, error);
          modalErrorOpenModal();
        }
    };

    const deletForn = async () => {
        try {
            await API.delete(`/fornecedor/delete/${selectedForn.IdFornecedor}`, selectedForn);
            getForns();
            deletCloseModal();
        } catch (error) {
            console.error('Erro ao excluir o usuário:', error);
        }
    };

    useEffect(() => {
        getForns();
    }, [getForns]);

    const getSearchForn = useCallback(async (fornSearch) => {
       
        if(!fornSearch || fornSearch.length === 0){
            getForns()
            return
        }
        try{
            const { data } = await API.get(`/fornecedor/search/?query=${fornSearch}`);
            
            if (data) {
                setTot(data.count)
                setForns(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            } else {
                setForns([])

            }
        } catch (error) {
            console.error('Erro ao buscar fornecedor:', error);
        }
    }, [getForns]);

    return (
        <div>
            <Menu />

            <div className="sticky top-14 right-0 w-full p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-white dark:border-white">
                <div className="w-full mb-1">
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold text-gray-200 sm:text-2xl dark:text-black">Fornecedores</h1>
                    </div>
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-100">
                            <form className="lg:pr-3" action="#" method="GET">
                                <label htmlFor="users-search" className="sr-only">Search</label>
                                <div className="relative mt-1 lg:w-64 xl:w-96">
                                <input
                                        type="text"
                                        name="pesquisar"
                                        id="users-search"
                                        className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder="Pesquisar"
                                        onChange={(e) => getSearchForn(e.target.value)}
                                    ></input>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                            <button type="button" onClick={openModal} className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-cyan-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-cyan-800">
                                    <tr>                                   
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">ID</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Razão Social</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Nome Fantasia</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">CNPJ</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Telefone</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Cidade</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                                    </tr>
                                </thead>
                                {forns.length > 0 ? (
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                        {forns.map((forn) => (
                                            <tr key={forn.IdFornecedor} className="hover:bg-gray-100 dark:hover:bg-gray-200">                                      
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.IdFornecedor}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.NomeJuridico}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.NomeFantasia}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.CNPJ}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.Telefone}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{forn.Cidade}</td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button type="button" onClick={() => { handleFornChange(forn.IdFornecedor); openModal(); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                        Editar
                                                    </button>
                                                    <button type="button" onClick={() => { handleFornChange(forn.IdFornecedor); deletOpenModal(); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                                        Deletar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>) : (
                                    <tr>
                                        <td colSpan="11" className="p-4 text-center">Nenhum fornecedor encontrado</td>
                                    </tr>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="st bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-cyan-800 dark:border-gray-700">
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-sm font-normal text-gray-500 dark:text-white">Total de fornecedores <span className="font-semibold text-gray-900 dark:text-white">{tot}</span></span>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={previousItems} disabled={previousPage === null} className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Anterior
                    </button >
                    <button onClick={nextItems} disabled={nextPage === null} className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        Próxima
                        <svg className="w-5 h-5 ml-1 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                    </button >
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { closeModal(); setSelectedForn(null) }}>
                {selectedForn ? (
                    <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Editar Fornecedor
                        </h3>
                    </div>) : (<div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Adicionar Fornecedor
                        </h3>
                    </div>)}
                {/* <!-- Modal body --> */}
                <div className="p-6 space-y-6">
                    {selectedForn ? (
                        <form action=" ">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="nomeJ" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Razão Social </label>
                                    <input
                                        type="text"
                                        name="nomeJ"
                                        value={selectedForn.NomeJuridico}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, NomeJuridico: e.target.value })}
                                        id="nomeJ"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="nomeF" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Nome Fantasia</label>
                                    <input
                                        type="text"
                                        name="nomeF"
                                        value={selectedForn.NomeFantasia}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, NomeFantasia: e.target.value })}
                                        id="nomeF"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cnpj" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">CNPJ</label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={selectedForn.CNPJ}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, CNPJ: e.target.value })}
                                        id="cnpj"
                                        disabled
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={selectedForn.Email}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, Email: e.target.value })}
                                        id="email"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Telefone</label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        value={selectedForn.Telefone}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, Telefone: e.target.value })}
                                        id="telefone"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="endereco" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Endereço</label>
                                    <input
                                        type="text"
                                        name="endereco"
                                        value={selectedForn.NomeRua}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, NomeRua: e.target.value })}
                                        id="endereco"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="numero" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Número</label>
                                    <input
                                        type="text"
                                        name="numero"
                                        value={selectedForn.Numero}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, Numero: e.target.value })}
                                        id="numero"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="bairro" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Bairro</label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        value={selectedForn.NomeBairro}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, NomeBairro: e.target.value })}
                                        id="bairro"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cidade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Cidade</label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        value={selectedForn.Cidade}
                                        onChange={(e) => setSelectedForn({ ...selectedForn, Cidade: e.target.value })}
                                        id="cidade"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form action=" ">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="nomeJ" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Razão Social <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="nomeJ"
                                        onChange={(e) => setCreateForn({ ...createForn, NomeJuridico: e.target.value })}
                                        id="nomeJ"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="NomeFantasia" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Nome Fantasia <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="NomeFantasia"
                                        onChange={(e) => setCreateForn({ ...createForn, NomeFantasia: e.target.value })}
                                        id="NomeFantasia"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cnpj" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">CNPJ <span className="text-red-600">*</span></label>
                                    <InputMask
                                        type="text"
                                        name="cnpj"
                                        onChange={(e) => setCreateForn({ ...createForn, CNPJ: e.target.value })}
                                        id="cnpj"
                                        mask={"99.999.999/9999-99"}
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Email <span className="text-red-600">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        onChange={(e) => setCreateForn({ ...createForn, Email: e.target.value })}
                                        id="email"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Telefone <span className="text-red-600">*</span></label>
                                    <InputMask
                                        type="text"
                                        name="telefone"
                                        onChange={(e) => setCreateForn({ ...createForn, Telefone: e.target.value })}
                                        id="telefone"
                                        mask={"(99)99999-9999"}
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="endereco" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Endereço <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="endereco"
                                        onChange={(e) => setCreateForn({ ...createForn, NomeRua: e.target.value })}
                                        id="endereco"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="numero" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Número <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="numero"
                                        onChange={(e) => setCreateForn({ ...createForn, Numero: e.target.value })}
                                        id="numero"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="bairro" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Bairro <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="bairro"
                                        onChange={(e) => setCreateForn({ ...createForn, NomeBairro: e.target.value })}
                                        id="bairro"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cidade" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Cidade <span className="text-red-600">*</span></label>
                                    <input
                                        type="text"
                                        name="cidade"
                                        onChange={(e) => setCreateForn({ ...createForn, Cidade: e.target.value })}
                                        id="cidade"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>
                {/* <!-- Modal footer --> */}
                {selectedForn ? (
                    <div className="items-center p-5 border-t  border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        <button onClick={() => { updateForn(); setSelectedForn(null); }} className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">Salvar Alteração</button>
                    </div>)
                    :
                    (<div className="items-center p-5 border-t  border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        <button onClick={addForn} className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">Salvar Novo</button>
                    </div>)}
            </Modal>

            <Modal isOpen={deletModalOpen} onClose={() => { deletCloseModal(); setSelectedForn(null) }}>
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="p-10 pt-10 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-600" fillRule="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>

                        {selectedForn ? (
                            <h3 className="mt-5 mb-6 text-lg text-white dark:text-white">Tem certeza de que deseja excluir {selectedForn.NomeJuridico}?</h3>
                        ) : (
                            <h3 className="mt-5 mb-6 text-lg text-white dark:text-white">Tem certeza de que deseja excluir este fornecedor? </h3>
                        )}

                        <button onClick={ () => {deletForn(); setSelectedForn(null)}} className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2 dark:focus:ring-red-800">
                            Sim, tenho certeza
                        </button>

                        <button onClick={ () => {deletCloseModal(); setSelectedForn(null)}} className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" data-modal-hide="delete-forn-modal">
                            Não, cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            <ModalError isOpen={modalErrorOpen} onClose={modalErrorCloseModal}>
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="p-10 pt-10 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-600" fillRule="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="mt-5 mb-6 text-lg text-white dark:text-white">{errorMessage}</h3>
                        <button onClick={ modalErrorCloseModal } className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" data-modal-hide="delete-user-modal">
                            OK
                        </button>
                    </div>
                </div>
            </ModalError>
        </div >
    )
}
export default Fornecedor;