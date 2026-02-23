import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  Printer,
  CheckCircle2,
  Truck,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, trend, color = 'orange' }) => {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10',
  };
  
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white font-['Manrope']">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '+' : ''}{trend}% este mês
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axios.get(`${API}/dashboard/stats`),
          axios.get(`${API}/dashboard/chart-data`)
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data.map(d => ({
          ...d,
          month: format(new Date(d.month + '-01'), 'MMM', { locale: ptBR })
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Pedidos"
          value={stats?.total_orders || 0}
          icon={Package}
          color="orange"
        />
        <StatCard
          title="Clientes"
          value={stats?.total_clients || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Receita Total"
          value={`R$ ${(stats?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pedidos este Mês"
          value={stats?.orders_this_month || 0}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Pendentes</p>
              <p className="text-lg font-bold text-white">{stats?.pending_orders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Printer className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Imprimindo</p>
              <p className="text-lg font-bold text-white">{stats?.printing_orders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Concluídos</p>
              <p className="text-lg font-bold text-white">{stats?.completed_orders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Truck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Entregues</p>
              <p className="text-lg font-bold text-white">{stats?.delivered_orders || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Cancelados</p>
              <p className="text-lg font-bold text-white">{stats?.cancelled_orders || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-['Manrope'] text-white">Pedidos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fafafa' }}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-['Manrope'] text-white">Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fafafa' }}
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
