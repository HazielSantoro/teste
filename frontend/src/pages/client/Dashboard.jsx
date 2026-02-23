import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    printing: orders.filter(o => o.status === 'printing').length,
    completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
  };

  const recentOrders = orders.slice(0, 5);

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
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-xl text-white mb-2">
          Olá, <span className="text-orange-500 font-semibold">{user?.name}</span>!
        </h2>
        <p className="text-zinc-400">Acompanhe seus pedidos de impressão 3D</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Pendentes</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Em Produção</p>
              <p className="text-xl font-bold text-white">{stats.printing}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Concluídos</p>
              <p className="text-xl font-bold text-white">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-['Manrope'] text-white">Pedidos Recentes</CardTitle>
          <Link 
            to="/client/orders" 
            className="text-sm text-orange-500 hover:text-orange-400"
            data-testid="view-all-orders-link"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Você ainda não tem pedidos</p>
              <p className="text-sm text-zinc-600 mt-1">
                Entre em contato conosco para fazer seu primeiro pedido!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white font-medium truncate">{order.file_name}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-zinc-500">
                      {order.material_name} • {order.quantity}x • {order.weight_grams}g
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-green-500 font-mono font-semibold">
                      R$ {order.total_price.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(order.created_at), "dd/MM/yy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ClientDashboard;
