import { Link } from "react-router-dom";

function Login() {
    return (
        <div class="min-h-screen bg-white flex">
            {/* hidden vai fazer com que no mobile nao apareça a img a esquerda */}
            <div class="hidden lg:block relative w-0 flex-1 bg-cyan-800">
                <div class="flex h-full justify-center items-center text-6xl font-semibold text-white">
                    {/* colocar imagem ou texto aqui  */}
                    <h1>Bem-Vindo</h1>
                </div>
            </div>
            <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        {/* por uma img p quando a de cima nao aparecer  */}
                        <h2 class="mt-6 text-3x1 font-semibold text-cyan-800 text-2xl">Login</h2>
                    </div>
                    <div class="mt-6">
                        <form action="">
                            <div class="mb-4">
                                <input type="text" placeholder="Usuário" class="apperance-none block w-full py-3 px-4 leading-tight text-gray-700 bg-gray-50 focus:bg-white border border-gray-200 focus:border-gray-500 rounded focus: outline-none">
                                </input>
                            </div>
                            <div class="mb-4">
                                <input type="password" placeholder="Senha" class="apperance-none block w-full py-3 px-4 leading-tight text-gray-700 bg-gray-50 focus:bg-white border border-gray-200 focus:border-gray-500 rounded focus: outline-none">
                                </input>
                            </div>
                            <div class="mb-4">
                                <Link class="inline-block w-full py-4 px-8 leading-none text-white bg-cyan-800 hover:bg-cyan-900 font-semibold rounded shadow" to="/Menu">Entrar</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Login;