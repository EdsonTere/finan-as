import { useMemo, useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FinanceProvider, useFinance } from './contexts/FinanceContext'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { ReportsPage } from './pages/ReportsPage'
import { AccountsPage } from './pages/AccountsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { TransactionModal } from './components/TransactionModal'
import { cn, formatCurrency, formatDate } from './lib/utils'
import { Plus, TrendingUp, TrendingDown, Target, FileText, Trash2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

function Dashboard() {
  const { summary, transactions, deleteTransaction, categories } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const monthlyHistory = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();

    // Generate last 6 months
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthTag = d.toISOString().substring(0, 7);
      const monthIndex = d.getMonth();

      const monthIncome = (transactions || [])
        .filter(t => t.type === 'income' && t.date.substring(0, 7) === monthTag)
        .reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);

      const monthExpense = (transactions || [])
        .filter(t => t.type === 'expense' && t.date.substring(0, 7) === monthTag)
        .reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);

      return {
        name: months[monthIndex],
        receitas: monthIncome,
        despesas: monthExpense,
      };
    });
  }, [transactions]);

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe sua saúde financeira em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('income')} className="btn btn-primary bg-success hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
            <Plus size={18} /> Receita
          </button>
          <button onClick={() => openModal('expense')} className="btn btn-primary bg-danger hover:bg-rose-600 shadow-lg shadow-rose-500/20">
            <Plus size={18} /> Despesa
          </button>
        </div>
      </header>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-none bg-brand-600 text-white shadow-xl shadow-brand-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><Target size={20} /></div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full text-white">Saldo Ativo</span>
          </div>
          <p className="text-brand-100 text-sm font-medium">Patrimônio Líquido</p>
          <h3 className="text-3xl font-bold mt-1">
            {formatCurrency(summary.totalBalance)}
          </h3>
        </div>
        <div className="card shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold text-success capitalize">Entradas</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Entradas do Mês</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-white">
            {formatCurrency(summary.monthlyIncome)}
          </h3>
        </div>
        <div className="card shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg"><TrendingDown size={20} /></div>
            <span className="text-xs font-bold text-danger capitalize">Saídas</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Saídas do Mês</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-white">
            {formatCurrency(summary.monthlyExpense)}
          </h3>
        </div>
        <div className="card shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg"><FileText size={20} /></div>
            <span className="text-xs font-bold text-amber-500">A pagar</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Contas Pendentes</p>
          <h3 className="text-3xl font-bold mt-1 dark:text-white">{formatCurrency(0)}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h4 className="font-bold mb-6 dark:text-white">Fluxo de Caixa (6 meses)</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h4 className="font-bold mb-6 dark:text-white">Ganhos vs Gastos</h4>
          <div className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Receitas', value: summary.monthlyIncome || 1 },
                    { name: 'Despesas', value: summary.monthlyExpense || 0 }
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  <Cell fill="#10b981" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6 text-sm font-bold dark:text-white">Transações Recentes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs border-b border-slate-100 dark:border-slate-800 uppercase">
                <th className="pb-4">Descrição</th>
                <th className="pb-4">Categoria</th>
                <th className="pb-4">Data</th>
                <th className="pb-4 text-right">Valor</th>
                <th className="pb-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {(transactions || []).slice(0, 5).map(t => (
                <tr key={t.id} className="text-sm border-b border-slate-50 dark:border-slate-800/50 hover:bg-[var(--bg-hover)] transition-colors group">
                  <td className="py-4 font-medium dark:text-white">{t.description}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                    {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                  </td>
                  <td className="py-4 text-slate-500 dark:text-slate-400 text-xs text-center">
                    {formatDate(t.date)}
                  </td>
                  <td className={cn("py-4 text-right font-bold", t.type === 'income' ? "text-success" : "text-danger")}>
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isFinanceLoading, error: financeError } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (financeError) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="card max-w-md w-full border-danger/20 bg-danger/5 text-center">
        <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} />
        </div>
        <h2 className="text-xl font-bold text-danger mb-2">Erro de Conexão</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{financeError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary w-full bg-danger hover:bg-rose-600"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  if (isAuthLoading || isFinanceLoading) {
    const { user } = useAuth();
    const [showForceButton, setShowForceButton] = useState(false);

    // Show force button after 10 seconds
    useEffect(() => {
      const timer = setTimeout(() => setShowForceButton(true), 10000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
            <div className="absolute top-0 w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-900 dark:text-white font-bold text-lg">Sincronizando dados...</p>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                Autenticação: {isAuthLoading ? <span className="animate-pulse">◌ Verificando...</span> : <span className="text-success">✓ OK ({user?.email || 'Nenhum'})</span>}
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                Banco de Dados: {isFinanceLoading ? <span className="animate-pulse">◌ Conectando...</span> : <span className="text-success">✓ OK</span>}
              </p>
            </div>
          </div>

          {showForceButton && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg animate-bounce"
            >
              Forçar Recarregamento
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'accounts' && <AccountsPage />}
      {activeTab === 'categories' && <CategoriesPage />}
      {activeTab === 'income' && <TransactionsPage type="income" />}
      {activeTab === 'expenses' && <TransactionsPage type="expense" />}
      {activeTab === 'transfers' && <TransactionsPage type="transfer" />}
      {activeTab === 'reports' && <ReportsPage />}
      {activeTab === 'budgets' && <BudgetsPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App
