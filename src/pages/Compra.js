import { useEffect, useState, useCallback, useContext } from "react";
import API from "../utils/api";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import FornCombobox from "../components/FornCombobox";
import { FornContext } from '../context/FornContext';
import ModalError from "../components/ModalError";

function Compra() {
    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState([]);

    const modalErrorOpenModal = () => setModalErrorOpen(true);
    const modalErrorCloseModal = () => setModalErrorOpen(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isModalProdOpen, setIsModalProdOpen] = useState(false);
    const openProdModal = () => setIsModalProdOpen(true);
    const closeProdModal = () => setIsModalProdOpen(false);

    const [isModalProdQtdOpen, setIsModalProdQtdOpen] = useState(false);
    const openProdQtdModal = () => setIsModalProdQtdOpen(true);
    const closeProdQtdModal = () => setIsModalProdQtdOpen(false);

    const [comps, setComps] = useState([]);
    const [tot, setTot] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null);
    const [createComp, setCreateComp] = useState('');
    const { selectedForn, setSelectedForn } = useContext(FornContext);
    const [prods, setProds] = useState([]);
    const [addProdComp, setAddProdComp] = useState([]);

    const [nextPage, setNextPage] = useState();
    const [previousPage, setPreviousPage] = useState();

    const [formaPagamento, setFormaPagamento] = useState("");
    const [prazo, setPrazo] = useState("");
    const [parcelas, setParcelas] = useState();

    const adicionarProduto = () => {
        setAddProdComp((prevState) => [...prevState, selectedProd]);
        setSelectedProd({
            NomeProduto: '',
            QtdProduto: 0,
            Preco: 0,
            ValorTotal: 0,
        });
    };

    const nextItems = async () => {
        try {
            const response = await fetch(`${nextPage}`);
            const data = await response.json();
            setComps(data.results);
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
            setComps(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const previousPItems = async () => {
        try {
            const response = await fetch(`${previousPage}`);
            const data = await response.json();
            setProds(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };

    const nextPItems = async () => {
        try {
            const response = await fetch(`${nextPage}`);
            console.log(nextPage)
            const data = await response.json();
            setProds(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
    };


    const getComps = useCallback(async () => {
        try {
            const { data } = await API.get('/compras/');

            if (data && data.results) {
                setTot(data.count)
                setComps(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            }
        } catch (error) {
            console.error('Erro ao buscar compras:', error);
        }
    }, []);

    const handleCompChange = (compId) => {
        const comp = comps.find(c => c.IdCompra === compId);
        setSelectedComp(comp);
    };

    const handleFormaPagamentoChange = (e) => {
        const selectedForma = e.target.value;
        setFormaPagamento(selectedForma);

        if (selectedForma === 'À vista') {
            setPrazo("1");
            setParcelas(1);
        } else {
            setPrazo("");
            setParcelas("");
        }
    };

    const handlePrazoChange = (e) => {
        const inputPrazo = e.target.value;
        setPrazo(inputPrazo);

        const numParcelas = inputPrazo.split(',').filter(p => p.trim() !== '').length;
        setParcelas(numParcelas);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const compData = {
                "IdFornecedor": selectedForn.IdFornecedor,
                "DataCompra": createComp.DataCompra,
                "ValorTotal": novoValorTotal,
                "FormaPagamento": formaPagamento,
                "Prazo": prazo,
                "Parcelas": parcelas,
                "itens_compra": addProdComp.map(prod => ({
                    "IdProduto": prod.IdProduto,
                    "NomeProduto": prod.NomeProduto,
                    "QtdProduto": prod.QtdProduto,
                    "ValorUnitario": prod.Preco,
                    "ValorTotal": prod.ValorTotal
                }))
            };
            addComp(compData);
        } catch (error) {
            setErrorMessage('Confira se os campos estão preenchidos')
            modalErrorOpenModal()
        }
    };

    const [selectedProd, setSelectedProd] = useState({
        IdProduto: 0,
        NomeProduto: '',
        QtdProduto: 0,
        Preco: 0,
        ValorTotal: 0,
    });

    const handleQuantidadeChange = (e) => {
        const novaQtd = e.target.value;
        const novoValorTotal = novaQtd * selectedProd.Preco;

        setSelectedProd((prevState) => ({
            ...prevState,
            QtdProduto: novaQtd,
            ValorTotal: (novoValorTotal.toFixed(2)),
        }));
    };

    const handleProdChange = (prodId) => {
        const prod = prods.find(p => p.IdProduto === prodId);
        setSelectedProd(prod);
    };

    const addComp = async (compData) => {
        try {
            await API.post('/compra/create/', compData);
            getComps();
            setCreateComp(null)
            setAddProdComp([])
            setSelectedForn(null)
            setFormaPagamento("")
            setPrazo("")
            setParcelas()
            closeModal()

            setErrorMessage('');
        } catch (error) {
            if (error.response) {
                const errorData = error.response.data;

                const errorMessage = JSON.stringify(errorData, null, 2);

                setErrorMessage(errorMessage);
            } else {
                setErrorMessage('Erro ao adicionar compra. Tente novamente.');
            }

            console.error(errorMessage, error);
            modalErrorOpenModal();
        }
    };

    const getProds = useCallback(async () => {
        try {
            const { data } = await API.get('/produtos/');

            if (data && data.results) {
                setProds(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
                console.log(data.next)
            }
        } catch (error) {
            console.error('Erro ao buscar os produto:', error);
        }
    }, []);

    const getSearchComp = useCallback(async (compSearch) => {

        if (!compSearch || compSearch.length === 0) {
            getComps()
            return
        }
        try {
            const { data } = await API.get(`/compra/search/?query=${compSearch}`);

            if (data) {
                setTot(data.count)
                setComps(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            } else {
                setComps([])

            }
        } catch (error) {
            console.error('Erro ao buscar compra:', error);
        }
    }, [getComps]);

    const getSearchProd = useCallback(async (prodSearch) => {

        if (!prodSearch || prodSearch.length === 0) {
            getProds()
            return
        }
        try {
            const { data } = await API.get(`/produto/search/?query=${prodSearch}`);

            if (data) {
                setTot(data.count)
                setProds(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            } else {
                setProds([])

            }
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
        }
    }, [getProds]);


    useEffect(() => {
        getProds();
        getComps();
    }, [getComps, getProds]);

    const ValorTotal = selectedComp?.itens_compra?.reduce((acc, item) => {
        return acc + item.QtdProduto * item.ValorUnitario;
    }, 0);

    const novoValorTotal = addProdComp.reduce((acc, item) => {
        return acc + item.QtdProduto * item.Preco;
    }, 0);

    return (
        <div>
            <Menu />

            {/* Pesquisar e Adicionar */}
            <div className="sticky top-14 right-0 w-full p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-white dark:border-white">
                <div className="w-full mb-1">
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold text-gray-200 sm:text-2xl dark:text-black">Compra</h1>
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
                                        onChange={(e) => getSearchComp(e.target.value)}
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

            {/* Informaçoes */}
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-cyan-800">
                                    <tr>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">ID</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Fornecedor</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Data</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Valor</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700 overflow-y-auto" style={{ maxHeight: '300px' }}>
                                    {comps.length > 0 ? (
                                        comps.map((comp) => (
                                            <tr key={comp.IdCompra} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{comp.IdCompra}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{comp.IdFornecedor.NomeJuridico}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{comp.DataCompra}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{comp.ValorTotal.toFixed(2)}</td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button type="button" onClick={() => { handleCompChange(comp.IdCompra); openModal(); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                        Visualizar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center">Nenhuma compra encontrada</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paginação */}
            <div className="st bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-cyan-800 dark:border-gray-700">
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-sm font-normal text-gray-500 dark:text-white">Total de compras <span className="font-semibold text-gray-900 dark:text-white">{tot}</span></span>
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

            {/* Add e edt */}
            <Modal isOpen={isModalOpen} onClose={() => { closeModal(); setSelectedComp(null); setCreateComp(null); setAddProdComp([]); setSelectedForn(null); setParcelas(); setPrazo(''); setFormaPagamento('') }}>
                {selectedComp ? (
                    <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Visualizar Compra
                        </h3>
                    </div>) : (<div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Adicionar Compra
                        </h3>
                    </div>)}
                {/* <!-- Modal body --> */}
                <div className="p-6 space-y-6">
                    {selectedComp ? (
                        <form action=" ">
                            <div className="grid grid-cols-6 gap-6 ">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="fornecedor" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Fornecedor</label>
                                    <input
                                        type="text"
                                        name="fornecedor"
                                        value={selectedComp.IdFornecedor.NomeJuridico}
                                        onChange={(e) => setSelectedComp({ ...selectedComp, IdFornecedor: e.target.value })}
                                        id="fornecedor"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                        disabled
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3 ">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Data</label>
                                    <input
                                        type="date"
                                        name="data"
                                        value={selectedComp.DataCompra}
                                        onChange={(e) => setSelectedComp({ ...selectedComp, DataCompra: e.target.value })}
                                        id="data"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                        disabled
                                    />
                                </div>
                            </div>
                            <div >
                                {selectedComp.itens_compra.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto max-h-60">
                                            <table className="min-w-full bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                                <thead>
                                                    <tr>
                                                        <th className="p-4 text-sm text-start font-medium text-gray-700 whitespace-nowrap dark:text-black">Produto</th>
                                                        <th className="p-4 text-sm text-start font-medium text-gray-700 whitespace-nowrap dark:text-black">Quantidade</th>
                                                        <th className="p-4 text-sm text-start font-medium text-gray-700 whitespace-nowrap dark:text-black">Preço Unitário</th>
                                                        <th className="p-4 text-sm text-start font-medium text-gray-700 whitespace-nowrap dark:text-black">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                                    {selectedComp.itens_compra.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.NomeProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.QtdProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.ValorUnitario.toFixed(2)}$</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{(item.QtdProduto * item.ValorUnitario).toFixed(2)}$</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <div className="flex flex-col">
                                                    <span>Sub-Total:</span>
                                                    <span>Prazo:</span>
                                                    <span>Valor de cada parcela:</span>
                                                </div>
                                                <div className="flex flex-col pl-2 text-gray-500">
                                                    <span>{ValorTotal.toFixed(2)}$</span>
                                                    <span>{selectedComp.Prazo}</span>
                                                    <span>{(selectedComp.ValorTotal / selectedComp.Parcelas).toFixed(2)}$</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <span>Total:</span>
                                                <span className="pl-2 text-gray-500">{ValorTotal.toFixed(2)}$</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p>Nenhuma compra encontrada</p>
                                )}
                            </div>
                        </form>
                    ) : (
                        <form>
                            <div className="grid grid-cols-6 gap-6 mb-5 ">
                                <div className="col-span-6 sm:col-span-3">
                                    <FornCombobox />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Data</label>
                                    <input
                                        type="date"
                                        name="data"
                                        onChange={(e) => setCreateComp({ ...createComp, DataCompra: e.target.value })}
                                        id="data"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>

                            </div>
                            <div>
                                {addProdComp.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto max-h-60">
                                            <table className="min-w-full bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                                <thead>
                                                    <tr>
                                                        <th className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Produto</th>
                                                        <th className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Quantidade</th>
                                                        <th className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Preço Unitário</th>
                                                        <th className="p-4 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                                    {addProdComp.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.NomeProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.QtdProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.Preco.toFixed(2)}$</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.ValorTotal}$</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                            <div className="flex justify-end p-4">
                                                <span className="font-medium text-gray-700">Sub-Total:</span>
                                                <span className="pl-2 text-gray-500">{novoValorTotal.toFixed(2)}$</span>
                                            </div>
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <span>Total:</span>
                                                <span className="pl-2 text-gray-500">{novoValorTotal.toFixed(2)}$</span>
                                            </div>
                                        </div>

                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <table className="min-w-full bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                                <thead>
                                                    <tr>
                                                        <th className="px-10 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Produto</th>
                                                        <th className="px-14 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Quantidade</th>
                                                        <th className="px-20 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Preço Unitário</th>
                                                        <th className="px-14 text-sm font-medium text-gray-700 whitespace-nowrap dark:text-black">Total</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                            <p>adicione produtos a venda</p>
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-6 gap-6 mt-5">
                                {/* Forma de Pagamento */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Forma de Pagamento</label>
                                    <select
                                        value={formaPagamento}
                                        onChange={handleFormaPagamentoChange}
                                        className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2">
                                        <option value="">Selecione uma opção</option>
                                        <option value="À vista">À Vista</option>
                                        <option value="A prazo">A Prazo</option>
                                    </select>
                                </div>
                               
                                    {/* Prazo */}
                                    <div className="col-span-6 sm:col-span-2">
                                        <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Prazo</label>
                                        <input
                                            type="text"
                                            value={prazo}
                                            onChange={handlePrazoChange}
                                            placeholder="Ex: 10,20,35"
                                            className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2"
                                            disabled={formaPagamento === 'À vista'}
                                        />
                                    </div>

                                    {/* Parcelas (Gerado Automaticamente) */}
                                    <div className="col-span-6 sm:col-span-2 mb-4">
                                        <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Parcelas</label>
                                        <input
                                            type="number"
                                            value={parcelas}
                                            readOnly
                                            placeholder="Ex: 3"
                                            className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2"
                                            disabled={formaPagamento === 'À vista'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* <!-- Modal footer --> */}
                {selectedComp ?
                    (<div className="items-center p-8 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">

                    </div>)
                    :
                    (<div className="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        <button onClick={handleSubmit} className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">
                            Salvar Compra
                        </button>
                        <button type="button" onClick={openProdModal} className="float-end text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            Adicionar Produto
                        </button>
                    </div>)
                }
            </Modal>

            {/* Modal Produtos */}
            <Modal isOpen={isModalProdOpen} onClose={() => { closeProdModal() }}>
                <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white">
                        Produtos
                    </h3>
                    <div>
                        <form className="lg:pr-20" action="#" method="GET">
                            <div className="lg:w-64 xl:w-96">
                                <input
                                    type="text"
                                    name="pesquisar"
                                    id="users-search"
                                    className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Pesquisar"
                                    onChange={(e) => getSearchProd(e.target.value)}
                                ></input>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="overflow-y-scroll h-96">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-cyan-800">
                            <tr>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Nome</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Preço</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Estoque</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                            </tr>
                        </thead>
                        {prods.length > 0 ? (
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                {prods.map((prod) => (
                                    <tr key={prod.IdProduto} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.NomeProduto}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{(prod.Preco).toFixed(2)}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.Estoque}</td>
                                        <td className="p-4 space-x-2 whitespace-nowrap">
                                            <button type="button" onClick={() => { handleProdChange(prod.IdProduto); openProdQtdModal(); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                Adicionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>) : (
                            <p >Nenhum produto encontrado</p>
                        )}
                    </table>
                </div>
                <div className="items-center p-7 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                    <div className="flex items-center space-x-3">
                        <button onClick={previousPItems} className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            Anterior
                        </button >
                        <button onClick={nextPItems} className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            Próxima
                            <svg className="w-5 h-5 ml-1 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                        </button >
                    </div>
                </div>
            </Modal>

            {/* Qtd produto */}
            <Modal isOpen={isModalProdQtdOpen} onClose={() => { closeProdQtdModal() }}>
                <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white">
                        Produto
                    </h3>
                </div>
                <div>
                    <div>
                        <form action=" ">
                            <div className="grid grid-cols-6 gap-6 p-10">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cliente" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Nome Produto</label>
                                    <input
                                        type="text"
                                        name="nomeProduto"
                                        value={selectedProd.NomeProduto}
                                        onChange={(e) => setSelectedProd({ ...selectedProd, NomeProduto: e.target.value })}
                                        id="nomeProduto"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Quantidade</label>
                                    <input
                                        type="number"
                                        name="QtdProduto"
                                        value={selectedProd.QtdProduto}
                                        onChange={handleQuantidadeChange}
                                        id="QtdProduto"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder="1"
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Valor Unitário</label>
                                    <input
                                        type="number"
                                        name="ValorUnitario"
                                        value={(selectedProd.Preco.toFixed(2))}
                                        onChange={(e) => setSelectedProd({ ...selectedProd, Preco: e.target.value })}
                                        id="ValorUnitario"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Valor Total</label>
                                    <input
                                        type="number"
                                        name="ValorTotal"
                                        value={selectedProd.ValorTotal}
                                        id="ValorTotal"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                        disabled
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div onClick={() => { adicionarProduto(); closeProdQtdModal() }} className="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                    <button className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">
                        Adicionar Produto
                    </button>
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
        </div>
    )
}

export default Compra;