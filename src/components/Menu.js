import { Link } from "react-router-dom";

function Menu() {
    return (
        <nav className="sticky top-0 right-0 w-full flex items-center justify-between flex-wrap bg-cyan-800 p-3">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
                <Link to="/Menu" className="font-semibold text-2xl tracking-tight">Bem-Vindo</Link>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                <div className="text-sm lg:flex-grow">
                    <Link to="/CadCliente" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Cliente
                    </Link>
                    <Link to="/CadFornecedor" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Fornecedor
                    </Link>
                    <Link to="/CadProduto" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Produto
                    </Link>
                    <Link to="/Compra" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Compra
                    </Link>
                    <Link to="/Venda" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Venda
                    </Link>
                    <Link to="/CadReceber" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Conta Receber
                    </Link>
                    <Link to="/CadPagar" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Conta Pagar
                    </Link>
                </div>
                <div>
                    <Link to="/" className="inline-flex items-center text-sm px-4 py-2 leading-none border rounded-lg text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                        </svg>

                        Sair
                    </Link>
                </div>
            </div>
        </nav>
    )
}
export default Menu;