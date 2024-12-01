import React, { useState } from 'react';
import API from "../utils/api";
import Menu from '../components/Menu';


// Componente de pré-visualização do PDF
const PdfPreview = ({ pdfUrl }) => {
    return (
        <div className="text-center rounded-lg shadow-lg">
            <iframe
                src={pdfUrl}
                title="PDF Preview"
                style={{
                    width: '100%',
                    height: '600px',
                    border: 'none',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    marginTop: '20px'
                }}
            />
        </div>
    );
};

const RelatorioGenerator = () => {
    const [pdfUrl, setPdfUrl] = useState("");
    const [selectedReport, setSelectedReport] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const generateReport = () => {
        const endpointMap = {
            compra: 'compra/relatorio/',
            venda: 'venda/relatorio/',
            cliente: 'cliente/relatorio/',
            fornecedor: 'fornecedor/relatorio/',
            produto: 'produto/relatorio/',
        };

        const endpoint = endpointMap[selectedReport];
        if (!endpoint) {
            alert('Tipo de relatório desconhecido.');
            return;
        }

        setLoading(true);
        setError("");

        API.get(endpoint, {
            params: {
                data_inicio: startDate || undefined,
                data_fim: endDate || undefined,
            },
            responseType: 'blob',
        })
            .then(response => {
                const pdfUrl = URL.createObjectURL(response.data);
                setPdfUrl(pdfUrl);
                setLoading(false);
            })
            .catch(err => {
                setError("Erro ao gerar o relatório.");
                setLoading(false);
            });
    };

    // const handleSelectChange = (event) => {
    //     const reportType = event.target.value;
    //     setSelectedReport(reportType);
    //     if (reportType) {
    //         generateReport(reportType);
    //     } else {
    //         setPdfUrl("");
    //     }
    // };

    return (
        <div >
            <Menu />

            <div className="sticky top-14 right-0 w-full p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 dark:bg-white dark:border-white">
                <div className="w-full mb-1">
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold text-gray-200 sm:text-2xl dark:text-black">Gerar Relatórios em PDF</h1>
                    </div>
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-100">
                            <form className="lg:pr-3 w-full" action="#" method="GET">
                                <div className="mb-4">
                                    <label htmlFor="reportSelect" className="sr-only">Selecione o tipo de relatório</label>
                                    <select
                                        id="reportSelect"
                                        value={selectedReport}
                                        onChange={(e) => setSelectedReport(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    >
                                        <option value="">-- Selecione o tipo de relatório --</option>
                                        <option value="compra">Relatório de Compras</option>
                                        <option value="venda">Relatório de Vendas</option>
                                        <option value="cliente">Relatório de Clientes</option>
                                        <option value="fornecedor">Relatório de Fornecedores</option>
                                        <option value="produto">Relatório de Produtos</option>
                                    </select>
                                </div>

                                {/* Container com Flexbox para alinhar lado a lado */}
                                <div className="flex space-x-4">
                                    <div className="w-1/2">
                                        <label htmlFor="startDate" className="block text-gray-700">
                                            Data de Início
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label htmlFor="endDate" className="block text-gray-700">
                                            Data de Fim
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <button
                                            onClick={generateReport}
                                            className="w-full py-2 px-4 rounded-lg bg-cyan-800 text-white"
                                        >
                                            Gerar
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


            {!loading && !pdfUrl && (
                <div className="text-center p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl text-gray-700">Bem-vindo ao Gerador de Relatórios!</h2>
                    <p className="mt-2 text-gray-500">Selecione um tipo de relatório para começar a gerar seu PDF. Escolha entre Relatório de Compras, Vendas, Clientes, Fornecedores ou Produtos.</p>
                </div>
            )}

            {loading && <p className="loading-text">Carregando o relatório...</p>}

            {error && <p className="error-text">Erro: {error}</p>}

            {pdfUrl && <PdfPreview pdfUrl={pdfUrl} />}
        </div>
    );
};

export default RelatorioGenerator;
