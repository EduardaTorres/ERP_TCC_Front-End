import { useEffect, useState, useCallback } from "react";
import API from "../utils/api";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ModalError from '../components/ModalError';

function Pagar() {

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const confirmOpenModal = () => setConfirmModalOpen(true);
    const confirmCloseModal = () => setConfirmModalOpen(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [contaPagar, setContaPagar] = useState([])
    const [selectedContaP, setSelectedContaP] = useState(null);
    const [tot, setTot] = useState([])

    const [nextPage, setNextPage] = useState();
    const [previousPage, setPreviousPage] = useState();

    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState([]);
    const modalErrorOpenModal = () => setModalErrorOpen(true);
    const modalErrorCloseModal = () => setModalErrorOpen(false);

    const [selecteParcela, setSelecteParcela] = useState(null);

    const handleContaPChange = (contId) => {
        const contaApagar = contaPagar.find(r => r.compra.IdCompra === contId);
        setSelectedContaP(contaApagar);
    };

    const handleStatusChange = (e, idx) => {
        const updatedParcelas = [...selectedContaP.parcelas];

        updatedParcelas[idx] = {
            ...updatedParcelas[idx],
            Status: e.target.value === 'Pago',
        };

        setSelectedContaP({
            ...selectedContaP,
            parcelas: updatedParcelas,
        });

        const updatedParcela = {
            ...selectedContaP.parcelas[idx],
            Status: e.target.value === 'Pago',
        };

        setSelecteParcela(updatedParcela);
    };

    const nextItems = async () => {
        try {
            const response = await fetch(`${nextPage}`);
            const data = await response.json();
            setContaPagar(data.results);
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
            setContaPagar(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const updateContaPagar = async () => {
        try {
            await API.put(`/conta-pagar/update/${selecteParcela.IdContaPagar}`, selecteParcela);

            getContaPagar();
            setErrorMessage('');
        } catch (error) {
            let errorMessage = 'Erro ao editar o conta a pagar. Tente novamente.';

            if (error.response) {
                const errorData = error.response.data;
                errorMessage = JSON.stringify(errorData, null, 2);
            }

            setErrorMessage(errorMessage);
            console.error(errorMessage, error);
            modalErrorOpenModal();
        }
    };

    const getContaPagar = useCallback(async () => {
        try {
            const { data } = await API.get('/contas-pagar/')

            if (data && data.results) {
                setTot(data.count)
                setContaPagar(data.results)
                setNextPage(data.next)
                setPreviousPage(data.previous)
            }
        } catch (error) {
            console.error(console.error('Erro ao buscar as conta a pagar:', error))
        }
    }, [])

    useEffect(() => {
        getContaPagar()
    }, [getContaPagar])

    return (
        <div>
            <Menu />

            <div className="sticky top-14 right-0 w-full p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-white dark:border-white">
                <div className="w-full mb-1">
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold text-gray-200 sm:text-2xl dark:text-black">Contas a Pagar</h1>
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
                                    ></input>
                                </div>
                            </form>
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
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Nome</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Data da compra</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Forma de pagamento</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">qtd parcelas</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                                    </tr>
                                </thead>
                                {contaPagar.length > 0 ? (
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                        {contaPagar.map((cont) => (
                                            <tr key={cont.compra.IdCompra} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{cont.compra.IdCompra}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{cont.compra.IdFornecedor.NomeJuridico}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{cont.compra.DataCompra}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{cont.compra.FormaPagamento}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{cont.compra.Parcelas}</td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => { handleContaPChange(cont.compra.IdCompra); openModal(); }}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                                clipRule="evenodd"
                                                            ></path>
                                                        </svg>
                                                        Visualizar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>) : (
                                    <tr>
                                        <td colSpan="8" className="p-4 text-center">Nenhuma conta a pagar encontrada</td>
                                    </tr>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="st bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-cyan-800 dark:border-gray-700">
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-sm font-normal text-gray-500 dark:text-white">Total de Contas <span className="font-semibold text-gray-900 dark:text-white">{tot}</span></span>
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

            <Modal isOpen={isModalOpen} onClose={() => closeModal()}>
                <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white">
                        Valores a pagar
                    </h3>
                </div>
                <div>
                    {selectedContaP ? (
                        <div className="m-5">
                            <div className="overflow-x-auto max-h-80">
                                <table className="min-w-full bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="p-4 text-sm font-medium text-left text-gray-700 whitespace-nowrap dark:text-black">Valor</th>
                                            <th className="p-4 text-sm font-medium text-left text-gray-700 whitespace-nowrap dark:text-black">Data de compra</th>
                                            <th className="p-4 text-sm font-medium text-left text-gray-700 whitespace-nowrap dark:text-black">Pagamento</th>
                                            <th className="p-4 text-sm font-medium text-left text-gray-700 whitespace-nowrap dark:text-black">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                        {selectedContaP.parcelas.map((parcela, idx) => (
                                            <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{parcela.Valor} $</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{parcela.DataVencimento}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{parcela.Status ? 'Pago' : 'Pendente'}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">
                                                    {parcela.Status ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-green-500">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <select
                                                            value={parcela.Status ? 'Pago' : 'Pendente'}
                                                            // onChange={(e) => handleStatusChange(e, idx)}
                                                            onChange={(e) => {handleStatusChange(e, idx); confirmOpenModal()}}
                                                            className="border rounded p-1"
                                                        >
                                                            <option value="Pendente">Pendente</option>
                                                            <option value="Pago">Pago</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                <div className="flex justify-end p-4">
                                    <span className="font-medium text-gray-700">Sub-Total:</span>
                                    <span className="pl-2 text-gray-500">{(selectedContaP.compra.ValorTotal).toFixed(2)}$</span>
                                </div>
                                <div className="flex justify-end p-4 font-bold text-gray-700">
                                    <span>Total:</span>
                                    <span className="pl-2 text-gray-500">{(selectedContaP.compra.ValorTotal).toFixed(2)}$</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p>Erro ao carregar os dados.</p>
                        </div>
                    )}
                </div>
                <div className="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                    <button className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">Salvar Alteração</button>
                </div>
            </Modal>

            <ModalError isOpen={modalErrorOpen} onClose={modalErrorCloseModal}>
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="p-10 pt-10 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-600" fillRule="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="mt-5 mb-6 text-lg text-white dark:text-white">{errorMessage}</h3>
                        <button onClick={modalErrorCloseModal} className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" data-modal-hide="delete-user-modal">
                            OK
                        </button>
                    </div>
                </div>
            </ModalError>

            <ModalError isOpen={confirmModalOpen} onClose={() => { confirmCloseModal(); setSelecteParcela(null)}}>
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="p-10 pt-10 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-600" fillRule="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="mt-5 mb-6 text-lg text-white dark:text-white">Deseja realmente alterar? Ação irreversível</h3>
                        <button onClick={() => { updateContaPagar(); confirmCloseModal(); setSelecteParcela(null)}} className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" data-modal-hide="delete-user-modal">
                            OK
                        </button><button onClick={ confirmCloseModal } className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" data-modal-hide="delete-user-modal">
                            Cancelar
                        </button>
                    </div>
                </div>
            </ModalError>
        </div >
    )
}

export default Pagar;