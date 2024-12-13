import Menu from "../components/Menu";
import { useEffect, useState, useCallback, useContext } from "react";
import API from "../utils/api";
import Modal from "../components/Modal";
import ModalError from "../components/ModalError";
import UserCombobox from "../components/UserCombobox ";
import { UserContext } from '../context/UserContext';

function Venda() {
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

    const [isModalCancelamento, setIsModalCancelamento] = useState(false);
    const openCancelamento = () => setIsModalCancelamento(true);
    const closeCancelamento = () => setIsModalCancelamento(false);
    const [cancelamentoVenda, setCancelamentoVenda] = useState({});

    const [vends, setVends] = useState([]);
    const [tot, setTot] = useState([]);
    const [selectedVend, setSelectedVend] = useState(null);
    const [createVend, setCreateVend] = useState(null);
    const { selectedUser, setSelectedUser } = useContext(UserContext);
    const [prods, setProds] = useState([]);
    const [addProdVenda, setAddProdVenda] = useState([]);

    const [formaPagamento, setFormaPagamento] = useState("");
    const [prazo, setPrazo] = useState("");
    const [parcelas, setParcelas] = useState();

    const [nextPage, setNextPage] = useState();
    const [previousPage, setPreviousPage] = useState();

    const [motivo, setMotivo] = useState();

    const handleConfirmCancelamento = async () => {
        try {
            const body = {
                motivo: motivo,
            };

            await API.post(`/venda/estorno/?venda_id=${cancelamentoVenda.IdVenda}`, body);

            console.log("Venda cancelada com sucesso!");

            closeCancelamento();
            setCancelamentoVenda({});
            setMotivo('');
        } catch (error) {
            if (error.response) {
                const errorData = error.response.data;

                const errorMessage = JSON.stringify(errorData, null, 2);
                setErrorMessage(errorMessage);
            } else {
                setErrorMessage("Erro ao cancelar venda. Tente novamente.");
            }

            console.error(errorMessage || error);
            modalErrorOpenModal();
        }
        closeCancelamento();
        setCancelamentoVenda({});
        window.location.reload();
    };

    const nextItems = async () => {
        try {
            const response = await fetch(`${nextPage}`);
            const data = await response.json();
            setVends(data.results);
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
            setVends(data.results);
            setNextPage(data.next)
            setPreviousPage(data.previous)
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        }
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
        const totalComDesconto = calcularTotalComDesconto();
        try {

            const vendaData = {
                "TotalSemDesconto": novaTotalVenda,
                "TotalComDesconto": totalComDesconto,
                "DescontoValor": descontoValor,
                "DescontoPercentual": descontoPercentual,
                "IdCliente": selectedUser.IdPessoa,
                "DataVenda": createVend.DataVenda,
                "TotalVenda": totalComDesconto,
                "FormaPagamento": formaPagamento,
                "Prazo": prazo,
                "Parcelas": parcelas,
                "itens_venda": addProdVenda.map(prod => ({
                    "IdProduto": prod.IdProduto,
                    "NomeProduto": prod.NomeProduto,
                    "QtdProduto": prod.QtdProduto,
                    "ValorUnitario": prod.Preco,
                    "ValorTotal": prod.ValorTotal
                }))
            };

            addVend(vendaData);

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

    const handleVendChange = (vendId) => {
        const vend = vends.find(v => v.IdVenda === vendId);
        setSelectedVend(vend);
    };

    const adicionarProduto = () => {
        setAddProdVenda((prevState) => [...prevState, selectedProd]);
        setSelectedProd({
            NomeProduto: '',
            QtdProduto: 0,
            Preco: 0,
            ValorTotal: 0,
        });
    };

    const handleProdChange = (prodId) => {
        const prod = prods.find(p => p.IdProduto === prodId);
        setSelectedProd(prod);
    };

    const getProds = useCallback(async () => {
        try {
            const { data } = await API.get('/produtos/');

            if (data && data.results) {
                // setTotProd(data.count)
                setProds(data.results);
            }
        } catch (error) {
            console.error('Erro ao buscar os produto:', error);
        }
    }, []);

    const getVends = useCallback(async () => {
        try {
            const { data } = await API.get('/vendas/');

            if (data && data.results) {
                setTot(data.count)
                setVends(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            }
        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
        }
    }, []);

    const addVend = async (vendaData) => {
        try {
            await API.post('/venda/create/', vendaData);
            getVends();
            setCreateVend(null)
            setAddProdVenda([])
            setSelectedUser(null)
            setFormaPagamento("")
            setPrazo("")
            setParcelas()
            closeModal()
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

    const getSearchVend = useCallback(async (vendSearch) => {

        if (!vendSearch || vendSearch.length === 0) {
            getVends()
            return
        }
        try {
            const { data } = await API.get(`/venda/search/?query=${vendSearch}`);

            if (data) {
                setTot(data.count)
                setVends(data.results);
                setNextPage(data.next)
                setPreviousPage(data.previous)
            } else {
                setVends([])

            }
        } catch (error) {
            console.error('Erro ao buscar venda:', error);
        }
    }, [getVends]);

    useEffect(() => {
        getProds();
        getVends();
    }, [getVends, getProds]);

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

    const totalVenda = selectedVend?.itens_venda?.reduce((acc, item) => {
        return acc + item.QtdProduto * item.ValorUnitario;
    }, 0);

    const novaTotalVenda = addProdVenda.reduce((acc, item) => {
        return acc + item.QtdProduto * item.Preco;
    }, 0);

    const [descontoValor, setDescontoValor] = useState(0);
    const [descontoPercentual, setDescontoPercentual] = useState(0);

    const calcularTotalComDesconto = () => {
        let total = novaTotalVenda; // Valor antes do desconto

        if (descontoValor > 0) {
            total -= descontoValor; // Subtraia o desconto em valor
        } else if (descontoPercentual > 0) {
            total -= (novaTotalVenda * descontoPercentual) / 100; // Subtraia o desconto percentual
        }

        return Math.max(total, 0); // Garante que o total nunca será negativo
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Menu />

            <div className="sticky top-14 right-0 w-full p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-white dark:border-white">
                <div className="w-full mb-1">
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold text-gray-200 sm:text-2xl dark:text-black">Vendas</h1>
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
                                        onChange={(e) => getSearchVend(e.target.value)}
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
                            <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-cyan-800">
                                    <tr>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">ID</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Cliente</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Data</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Valor</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Status</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="scroll-tbody bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                    {vends.length > 0 ? (
                                        vends.map((vend) => (
                                            <tr key={vend.IdVenda} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.IdVenda}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.IdCliente.NomePessoa}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.DataVenda}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.TotalVenda.toFixed(2)}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">
                                                    {vend.Estornada === true ? "Estornada" : "Em Aberto"}
                                                </td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button type="button" onClick={() => { handleVendChange(vend.IdVenda); openModal(); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                        Visualizar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center">Nenhuma venda encontrada</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="st bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-cyan-800 dark:border-gray-700">
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-sm font-normal text-gray-500 dark:text-white">Total de vendas <span className="font-semibold text-gray-900 dark:text-white">{tot}</span></span>
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

            <Modal isOpen={isModalOpen} onClose={() => { closeModal(); setSelectedVend(null); setCreateVend(null); setAddProdVenda([]); setSelectedUser(null); setParcelas(); setPrazo(''); setFormaPagamento('') }}>
                {selectedVend ? (
                    <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Visualizar Venda
                        </h3>
                    </div>) : (<div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 className="text-xl font-semibold dark:text-white">
                            Adicionar Venda
                        </h3>
                    </div>)}
                {/* <!-- Modal body --> */}
                <div className="p-6 space-y-6">
                    {selectedVend ? (
                        <form action=" ">
                            <div className="grid grid-cols-6 gap-6 ">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="cliente" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Cliente</label>
                                    <input
                                        type="text"
                                        name="cliente"
                                        value={selectedVend.IdCliente.NomePessoa}
                                        onChange={(e) => setSelectedVend({ ...selectedVend, IdCliente: e.target.value })}
                                        id="cliente"
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
                                        value={selectedVend.DataVenda}
                                        onChange={(e) => setSelectedVend({ ...selectedVend, DataVenda: e.target.value })}
                                        id="data"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                        disabled
                                    />
                                </div>
                            </div>
                            <div >
                                {selectedVend.itens_venda.length > 0 ? (
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
                                                    {selectedVend.itens_venda.map((item, index) => (
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
                                                    <span>Desconto %</span>
                                                    <span>Desconto valor</span>
                                                </div>
                                                <div className="flex flex-col pl-2 text-gray-500">
                                                    <span>{totalVenda.toFixed(2)}$</span>
                                                    <span>{selectedVend.Prazo}</span>
                                                    <span>{(selectedVend.TotalVenda / selectedVend.Parcelas).toFixed(2)}$</span>
                                                    <span>{selectedVend.DescontoPercentual}</span>
                                                    <span>{selectedVend.DescontoValor}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <span>Total:</span>
                                                <span className="pl-2 text-gray-500">{selectedVend.TotalVenda.toFixed(2)}$</span>
                                            </div>


                                        </div>
                                    </>
                                ) : (
                                    <p>Nenhuma venda encontrada</p>
                                )}
                            </div>
                        </form>
                    ) : (
                        <form>
                            <div className="grid grid-cols-6 mb-5 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <UserCombobox />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Data</label>
                                    <input
                                        type="date"
                                        name="data"
                                        onChange={(e) => setCreateVend({ ...createVend, DataVenda: e.target.value })}
                                        id="data"
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder=""
                                        required
                                    />
                                </div>

                            </div>
                            <div>
                                {addProdVenda.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto max-h-40">
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
                                                    {addProdVenda.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.NomeProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.QtdProduto}</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.Preco}$</td>
                                                            <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{item.ValorTotal}$</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
                            </div>
                            <div className="grid grid-cols-6 mt-5 gap-6">
                                {/* Forma de Pagamento */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Forma de Pagamento</label>
                                    <select
                                        value={formaPagamento}
                                        onChange={handleFormaPagamentoChange}
                                        className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2"
                                    >
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
                                <div className="col-span-6 sm:col-span-2">
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

                                {/* Desconto Valor */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="descontoValor" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Desconto (Valor)</label>
                                    <input
                                        type="number"
                                        id="descontoValor"
                                        value={descontoValor}
                                        onChange={(e) => {
                                            const valor = parseFloat(e.target.value) || 0;
                                            setDescontoValor(valor);
                                            setDescontoPercentual(0); // Reseta o percentual ao mudar o valor
                                        }}
                                        className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2"
                                    />
                                </div>

                                {/* Desconto % */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="descontoPercentual" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Desconto (%)</label>
                                    <input
                                        type="number"
                                        id="descontoPercentual"
                                        value={descontoPercentual}
                                        onChange={(e) => {
                                            const percentual = parseFloat(e.target.value) || 0;
                                            setDescontoPercentual(percentual);
                                            setDescontoValor(0); // Reseta o valor ao mudar o percentual
                                        }}
                                        className="w-full text-left bg-white border border-gray-900 rounded-lg shadow-sm px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                <div className="flex justify-end p-2 font-bold text-gray-700">
                                    <span>Total:</span>
                                    <span className="pl-2 text-gray-500">{novaTotalVenda.toFixed(2)}$</span>
                                </div>
                            </div>
                            <div className="flex justify-end pr-2 font-bold text-gray-700">
                                <span>Desconto:</span>
                                <span className="pl-2 text-gray-500">
                                    {descontoValor > 0
                                        ? `- ${descontoValor.toFixed(2)}$`
                                        : descontoPercentual > 0
                                            ? `- ${descontoPercentual.toFixed(2)}%`
                                            : "Sem desconto"}
                                </span>
                            </div>
                            <div className="flex justify-end p-2 font-bold text-gray-700">
                                <span>Total com Desconto:</span>
                                <span className="pl-2 text-gray-500">{calcularTotalComDesconto().toFixed(2)}$</span>
                            </div>
                        </form>
                    )}
                </div>
                {/* <!-- Modal footer --> */}
                {selectedVend ? (
                    <div className="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        {/* Exibe o botão apenas se selectedVend.Estornada não for 'true' */}
                        {selectedVend.Estornada === false ? (
                            <button
                                className="py-2 px-8 rounded-lg bg-red-800 text-white"
                                onClick={() => {
                                    openCancelamento();
                                    setCancelamentoVenda(selectedVend);
                                }}
                            >
                                Cancelar Venda
                            </button>
                        ) : (<p>Venda Estornada</p>)}
                    </div>
                ) : (
                    <div className="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        <button
                            onClick={handleSubmit}
                            className="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            type="submit"
                        >
                            Salvar Venda
                        </button>
                        <button
                            type="button"
                            onClick={openProdModal}
                            className="float-end text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Adicionar Produto
                        </button>
                    </div>
                )}
            </Modal>

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

                </div>
            </Modal>

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
                                        id="estoque"
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
                                        value={selectedProd.Preco}
                                        onChange={(e) => setSelectedProd({ ...selectedProd, Preco: e.target.value })}
                                        id="cliente"
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

            <Modal isOpen={isModalCancelamento} onClose={() => closeCancelamento()}>
                <div className="flex items-start p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white">
                        Detalhes da venda
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Confirmar Cancelamento
                    </h3>
                    <p>Tem certeza de que deseja cancelar a venda abaixo?</p>
                    {/* Layout em flexbox para organizar as colunas */}
                    <div className="flex space-x-6">
                        {/* Coluna com as informações da venda */}
                        <div className="p-4 rounded-lg bg-gray-100 ">
                            <p><strong>Cliente:</strong> {cancelamentoVenda?.IdCliente?.NomePessoa || "N/A"}</p>
                            <p><strong>Data:</strong> {cancelamentoVenda?.DataVenda || "N/A"}</p>
                            <p><strong>Total:</strong> {cancelamentoVenda?.TotalVenda?.toFixed(2) || "0.00"}$</p>
                        </div>
                        {/* Coluna com o motivo do cancelamento */}
                        <div className="flex-1">
                            <h3 className="mb-2 text-sm font-semibold text-gray-900">Motivo do Cancelamento</h3>
                            <textarea
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full h-24 p-2 border rounded-lg resize-none focus:outline-none focus:ring focus:ring-primary-300 dark:border-gray-600 dark:text-black"
                                placeholder="Informe o motivo do cancelamento..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 p-4 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                    <button
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100  dark:bg-cyan-800 dark:text-white dark:hover:bg-gray-700"
                        onClick={closeCancelamento}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        onClick={handleConfirmCancelamento}
                    >
                        Confirmar
                    </button>
                </div>
            </Modal>

        </div >
    );
}

export default Venda;