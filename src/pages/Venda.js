import Menu from "../components/Menu";
import { useEffect, useState, useCallback, useContext } from "react";
import API from "../utils/api";
import Modal from "../components/Modal";
import UserCombobox from "../components/UserCombobox ";
import { UserContext } from '../context/UserContext';

function Venda() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isModalProdOpen, setIsModalProdOpen] = useState(false);
    const openProdModal = () => setIsModalProdOpen(true);
    const closeProdModal = () => setIsModalProdOpen(false);

    const [isModalProdQtdOpen, setIsModalProdQtdOpen] = useState(false);
    const openProdQtdModal = () => setIsModalProdQtdOpen(true);
    const closeProdQtdModal = () => setIsModalProdQtdOpen(false);

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

    const handleFormaPagamentoChange = (e) => {
        const selectedForma = e.target.value;
        setFormaPagamento(selectedForma);

        if (selectedForma === 'avista') {
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

        const vendaData = {
            "IdCliente": selectedUser.IdPessoa,
            "DataVenda": createVend.DataVenda,
            "TotalVenda": novaTotalVenda,
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
            console.error('Erro ao adicionar venda:', error);
        }
    };

    useEffect(() => {
        getProds();
        getVends();
    }, [getVends, getProds]);

    const totalVenda = selectedVend?.itens_venda?.reduce((acc, item) => {
        return acc + item.QtdProduto * item.ValorUnitario;
    }, 0);

    const novaTotalVenda = addProdVenda.reduce((acc, item) => {
        return acc + item.QtdProduto * item.Preco;
    }, 0);

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
                                    <input type="text" name="pesquisar" id="users-search" className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Pesquisar"></input>
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
                                        <th scope="col" className="p-4">
                                            <div className="flex items-center">
                                                <input id="checkbox-all" aria-describedby="checkbox-1" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"></input>
                                                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                            </div>
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">ID</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Cliente</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Data</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Valor</th>
                                        <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700 overflow-y-auto" style={{ maxHeight: '300px' }}>
                                    {vends.length > 0 ? (
                                        vends.map((vend) => (
                                            <tr key={vend.IdVenda} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                                <td className="w-4 p-4">
                                                    <div className="flex items-center">
                                                        <input id={`checkbox-${vend.IdVenda}`} aria-describedby="checkbox-1" type="checkbox" className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"></input>
                                                        <label htmlFor={`checkbox-${vend.IdVenda}`} className="sr-only">checkbox</label>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.IdVenda}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.IdCliente.NomePessoa}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.DataVenda}</td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{vend.TotalVenda.toFixed(2)}</td>
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

            <div class="sticky bottom-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-cyan-800 dark:border-gray-700">
                <div class="flex items-center mb-4 sm:mb-0">
                    <span class="text-sm font-normal text-gray-500 dark:text-white">Total de vendas <span class="font-semibold text-gray-900 dark:text-white">{tot}</span></span>
                </div>
                <div class="flex items-center space-x-3">
                    <a href=" " class="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        <svg class="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                        Anterior
                    </a>
                    <a href=" " class="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        Próxima
                        <svg class="w-5 h-5 ml-1 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                    </a>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { closeModal(); setSelectedVend(null); setCreateVend(null); setAddProdVenda([]); setSelectedUser(null); setParcelas(); setPrazo(''); setFormaPagamento('') }}>
                {selectedVend ? (
                    <div class="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 class="text-xl font-semibold dark:text-white">
                            Visualizar Venda
                        </h3>
                    </div>) : (<div class="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                        <h3 class="text-xl font-semibold dark:text-white">
                            Adicionar Venda
                        </h3>
                    </div>)}
                {/* <!-- Modal body --> */}
                <div class="p-6 space-y-6">
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
                                        <div className="overflow-x-auto max-h-80">
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
                                                </div>
                                                <div className="flex flex-col pl-2 text-gray-500">
                                                    <span>{totalVenda.toFixed(2)}$</span>
                                                    <span>{selectedVend.Prazo}</span>
                                                    <span>{(selectedVend.TotalVenda / selectedVend.Parcelas).toFixed(2)}$</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <span>Total:</span>
                                                <span className="pl-2 text-gray-500">{totalVenda.toFixed(2)}$</span>
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
                            <div className="grid grid-cols-6 gap-6">
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
                                        disabled={formaPagamento === 'avista'}
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
                                        disabled={formaPagamento === 'avista'}
                                    />
                                </div>
                            </div>
                            <div>
                                {addProdVenda.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto max-h-80">
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
                                                    {addProdVenda.map((item, index) => (
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
                                                <span className="pl-2 text-gray-500">{novaTotalVenda.toFixed(2)}$</span>
                                            </div>
                                            <div className="flex justify-end p-4 font-bold text-gray-700">
                                                <span>Total:</span>
                                                <span className="pl-2 text-gray-500">{novaTotalVenda.toFixed(2)}$</span>
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
                            </div>
                        </form>
                    )}
                </div>
                {/* <!-- Modal footer --> */}
                {selectedVend ?
                    (<div class="items-center p-8 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">

                    </div>)
                    :
                    (<div class="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                        <button onClick={handleSubmit} class="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">
                            Salvar Venda
                        </button>
                        <button type="button" onClick={openProdModal} className="float-end text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                            Adicionar Produto
                        </button>
                    </div>)
                }
            </Modal>

            <Modal isOpen={isModalProdOpen} onClose={() => { closeProdModal() }}>
                <div class="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 class="text-xl font-semibold dark:text-white">
                        Produtos
                    </h3>
                </div>
                <div className="overflow-y-scroll h-96">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-cyan-800">
                            <tr>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">ID</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Nome</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Descrição</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Preço</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Unidade Medida</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Estoque</th>
                                <th scope="col" className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
                            </tr>
                        </thead>
                        {prods.length > 0 ? (
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-white dark:divide-gray-700">
                                {prods.map((prod) => (
                                    <tr key={prod.IdProduto} className="hover:bg-gray-100 dark:hover:bg-gray-200">
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.IdProduto}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.NomeProduto}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.Descricao}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{(prod.Preco).toFixed(2)}</td>
                                        <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-black">{prod.UnidMedida}</td>
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
                <div class="items-center p-7 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">

                </div>
            </Modal>

            <Modal isOpen={isModalProdQtdOpen} onClose={() => { closeProdQtdModal() }}>
                <div class="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                    <h3 class="text-xl font-semibold dark:text-white">
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
                                        value={(selectedProd.Preco.toFixed(2))}
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
                <div onClick={() => { adicionarProduto(); closeProdQtdModal() }} class="items-center p-5 border-t border-gray-200 rounded-b dark:border-gray-700 dark:bg-cyan-800">
                    <button class="text-white bg-primary-700 border border-white hover:border-transparent hover:bg-white hover:text-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" type="submit">
                        Adicionar Produto
                    </button>
                </div>
            </Modal>
        </div >
    );
}

export default Venda;