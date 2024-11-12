import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from "./pages/Login";
import TelaInicial from "./pages/TelaInicial";
import Cliente from "./pages/CadCliente";
import Fornecedor from './pages/CadFornecedor';
import Produto from './pages/CadProduto';
import Venda from './pages/Venda';
import Receber from './pages/CadReceber';
import Compra from './pages/Compra';
import Pagar from './pages/CadPagar';
import Relatorio from './pages/Relatorios'

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
          <Route path="/CadReceber" element={<Receber />}></Route>
          <Route path="/CadPagar" element={<Pagar />}></Route>
          <Route path="/Compra" element={<Compra />}></Route>
          <Route path="/Relatorios" element={<Relatorio />}></Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
