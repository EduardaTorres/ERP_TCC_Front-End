import { Link } from "react-router-dom";

function Menu() {
    return (
        <nav class="sticky top-0 right-0 w-full flex items-center justify-between flex-wrap bg-cyan-800 p-3">
            <div class="flex items-center flex-shrink-0 text-white mr-6">
                <Link to="/Menu" class="font-semibold text-2xl tracking-tight">Bem-Vindo</Link>
            </div>
            <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                <div class="text-sm lg:flex-grow">
                    <Link to="/CadCliente" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Cliente
                    </Link>
                    <Link to="/CadFornecedor" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Fornecedor
                    </Link>
                    <Link to="/CadProduto" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Produto
                    </Link>
                    <Link to="/Compra" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Compra
                    </Link>
                    <Link to="/Venda" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Venda
                    </Link>
                    <Link to="/CadReceber" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Conta Receber
                    </Link>
                    <Link to="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
                        Conta Pagar
                    </Link>
                </div>
                <div>
                    <a href=" " class="inline-block text-sm px-4 py-2 leading-none border rounded-lg text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Sair</a>
                </div>
            </div>
        </nav>
    )
}
export default Menu;