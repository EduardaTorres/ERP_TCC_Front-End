import React, { useState, useCallback, useEffect, useRef } from 'react';
import API from '../utils/api';
import Modal from "./Modal";

const ProdutosModal = ({ isModalProdOpen, closeProdModal }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [prods, setProds] = useState([]);
    const observerRef = useRef(null); // Referência para o "sentinela" no final da lista

    // Função para buscar produtos
    const getProds = useCallback(async (page = 1) => {
        try {
            const { data } = await API.get(`/produtos/?page=${page}`);
            
            if (data && data.results) {
                setProds((prevProds) => [...prevProds, ...data.results]);

                if (!data.next) {
                    setHasMore(false); // Não há mais páginas para carregar
                }
            }
        } catch (error) {
            console.error('Erro ao buscar os produtos:', error);
        }
    }, []);

    // Busca inicial e quando a página muda
    useEffect(() => {
        getProds(page);
    }, [page, getProds]);

    // Configura o IntersectionObserver
    useEffect(() => {
        if (!hasMore) return; // Se não há mais para carregar, não configura o observer

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { threshold: 1.0 } // Aciona quando o sentinela está 100% visível
        );

        if (observerRef.current) observer.observe(observerRef.current);

        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [hasMore]);

    return (
        <Modal isOpen={isModalProdOpen} onClose={closeProdModal}>
            <div className="flex items-start justify-between p-5 border-b rounded-t dark:bg-cyan-800 dark:border-gray-700">
                <h3 className="text-xl font-semibold dark:text-white">Produtos</h3>
                <div>
                    <form className="lg:pr-20" action="#" method="GET">
                        <div className="lg:w-64 xl:w-96">
                            <input
                                type="text"
                                name="pesquisar"
                                id="users-search"
                                className="bg-gray-50 border border-gray-300 text-gray-300 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-700 dark:text-black dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Pesquisar"
                                onChange={(e) => console.log('Pesquisa não implementada')}
                            />
                        </div>
                    </form>
                </div>
            </div>
            <div className="overflow-y-scroll h-96">
                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-cyan-800">
                        <tr>
                            <th className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Nome</th>
                            <th className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Preço</th>
                            <th className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Estoque</th>
                            <th className="p-4 text-xs font-medium tracking-wider text-left text-gray-300 uppercase dark:text-white">Ação</th>
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
                                        <button
                                            type="button"
                                            onClick={() => console.log('Ação não implementada')}
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-cyan-800 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                        >
                                            Adicionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <p>Nenhum produto encontrado</p>
                    )}
                </table>
                {/* Sentinela */}
                <div ref={observerRef} style={{ height: '1px' }}></div>
            </div>
        </Modal>
    );
};

export default ProdutosModal;
