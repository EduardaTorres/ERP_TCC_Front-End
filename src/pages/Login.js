import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../utils/api";

function Login() {
    const [credenciais, setCredenciais] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await API.post("/login/", credenciais);
            const data = response.data;

            localStorage.setItem("authToken", data.token.key);
            navigate("/Menu");
        } catch (err) {
            setError("Credenciais inválidas. Tente novamente.");
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            <div className="hidden lg:block relative w-0 flex-1 bg-cyan-800">
                <div className="flex h-full justify-center items-center text-6xl font-semibold text-white">
                    <h1>Bem-Vindo</h1>
                </div>
            </div>
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 className="mt-6 text-3x1 font-semibold text-cyan-800 text-2xl">Login</h2>
                    </div>
                    <div className="mt-6">
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Usuário"
                                    className="appearance-none block w-full py-3 px-4 leading-tight text-gray-700 bg-gray-50 focus:bg-white border border-gray-200 focus:border-gray-500 rounded focus:outline-none"
                                    value={credenciais.username}
                                    onChange={(e) =>
                                        setCredenciais({ ...credenciais, username: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    className="appearance-none block w-full py-3 px-4 leading-tight text-gray-700 bg-gray-50 focus:bg-white border border-gray-200 focus:border-gray-500 rounded focus:outline-none"
                                    value={credenciais.password}
                                    onChange={(e) =>
                                        setCredenciais({ ...credenciais, password: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            <div className="mb-4">
                                <button
                                    type="submit"
                                    className="inline-block w-full py-4 px-8 leading-none text-white bg-cyan-800 hover:bg-cyan-900 font-semibold rounded shadow"
                                >
                                    Entrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
