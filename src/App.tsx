import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Plan from './pages/Plan';
import Reports from './pages/Reports';
import Recurring from './pages/Recurring';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/recurring" element={<Recurring />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
