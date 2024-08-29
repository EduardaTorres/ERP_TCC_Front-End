import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from "./pages/Login";
import TelaInicial from "./pages/TelaInicial";
import Cliente from "./pages/CadCliente";
import Fornecedor from './pages/CadFornecedor';
import Produto from './pages/CadProduto';
import Venda from './pages/Venda';
import Modal from './components/Modal';
import Receber from './pages/CadReceber';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/Menu" element={<TelaInicial />}></Route>
          <Route path="/CadCliente" element={<Cliente />}></Route>
          <Route path="/CadFornecedor" element={<Fornecedor />}></Route>
          <Route path="/CadProduto" element={<Produto />}></Route>
          <Route path="/Venda" element={<Venda />}></Route>
          <Route path="/Modal" element={<Modal />}></Route>
          <Route path="/CadReceber" element={<Receber />}></Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
