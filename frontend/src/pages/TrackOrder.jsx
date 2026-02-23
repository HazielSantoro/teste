import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatusBadge from '../components/StatusBadge';
import { Printer, Package, Clock, Calendar, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusSteps = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'printing', label: 'Em Impressão', icon: Printer },
  { key: 'completed', label: 'Concluído', icon: CheckCircle2 },
  { key: 'delivered', label: 'Entregue', icon: Truck },
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API}/track/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Pedido não encontrado');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] grid-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] grid-bg flex items-center justify-center p-4">
        <Card className="glass border-zinc-800 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Pedido não encontrado</h2>
            <p className="text-zinc-500 mb-6">{error}</p>
            <Link 
              to="/login"
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Fazer login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-[#09090b] grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center neon-glow">
            <Printer className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-['Manrope']">3D Print Master</h1>
            <p className="text-sm text-zinc-500">Rastreamento de Pedido</p>
          </div>
        </div>

        <Card className="glass border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-['Manrope'] text-white">
                Pedido #{order.id.slice(0, 8)}
              </CardTitle>
              <StatusBadge status={order.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Material</span>
                </div>
                <p className="text-white font-medium">{order.material_name}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Criado em</span>
                </div>
                <p className="text-white font-medium">
                  {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            {order.status !== 'cancelled' ? (
              <div className="py-4">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800" />
                  <div 
                    className="absolute top-5 left-0 h-0.5 bg-orange-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  />
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-zinc-800 text-zinc-500'
                            } ${isCurrent ? 'ring-4 ring-orange-500/30' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`mt-2 text-sm font-medium ${
                            isCompleted ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-500 font-medium">Este pedido foi cancelado</p>
              </div>
            )}

            {/* Delivery Date */}
            {order.delivery_date && (
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">Previsão de Entrega</span>
                </div>
                <p className="text-white font-medium">
                  {format(new Date(order.delivery_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-zinc-500 text-sm mt-6">
          <Link to="/login" className="text-orange-500 hover:text-orange-400">
            Fazer login
          </Link>
          {' '}para ver mais detalhes
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
