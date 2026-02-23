import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Eye, Copy, Package, Calendar, Scale, FileBox, Clock, Printer, CheckCircle2, Truck } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusSteps = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'printing', label: 'Em Impressão', icon: Printer },
  { key: 'completed', label: 'Concluído', icon: CheckCircle2 },
  { key: 'delivered', label: 'Entregue', icon: Truck },
];

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const copyTrackingLink = (orderId) => {
    const link = `${window.location.origin}/track/${orderId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de rastreamento copiado!');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.material_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCurrentStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <DashboardLayout title="Meus Pedidos">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meus Pedidos">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por arquivo, ID ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-my-orders-input"
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-zinc-900/50 border-zinc-800 text-white" data-testid="my-orders-status-filter">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="printing">Em Impressão</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <Card 
              key={order.id} 
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => { setSelectedOrder(order); setIsViewOpen(true); }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{order.file_name}</p>
                    <p className="text-xs text-zinc-500 font-mono">#{order.id.slice(0, 8)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileBox className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">{order.material_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">{order.weight_grams}g × {order.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    {format(new Date(order.created_at), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                  <p className="text-lg font-bold text-green-500 font-['JetBrains_Mono']">
                    R$ {order.total_price.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-['Manrope']">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Status Progress */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="py-4">
                  <div className="relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800" />
                    <div 
                      className="absolute top-5 left-0 h-0.5 bg-orange-500 transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex(selectedOrder.status) / (statusSteps.length - 1)) * 100}%` }}
                    />
                    
                    <div className="relative flex justify-between">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= getCurrentStepIndex(selectedOrder.status);
                        const isCurrent = index === getCurrentStepIndex(selectedOrder.status);
                        
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
                            <span className={`mt-2 text-xs font-medium ${
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
              )}

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <FileBox className="w-4 h-4" />
                    <span className="text-xs">Arquivo</span>
                  </div>
                  <p className="text-white truncate">{selectedOrder.file_name}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs">Material</span>
                  </div>
                  <p className="text-white">{selectedOrder.material_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Quantidade</p>
                  <p className="text-xl font-bold text-white">{selectedOrder.quantity}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Peso</p>
                  <p className="text-xl font-bold text-white">{selectedOrder.weight_grams}g</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Valor</p>
                  <p className="text-xl font-bold text-green-500 font-['JetBrains_Mono']">
                    R$ {selectedOrder.total_price.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">Observações</p>
                  <p className="text-white">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Criado em</span>
                  </div>
                  <p className="text-white">
                    {format(new Date(selectedOrder.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {selectedOrder.delivery_date && (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Truck className="w-4 h-4" />
                      <span className="text-xs">Previsão de Entrega</span>
                    </div>
                    <p className="text-white">
                      {format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => copyTrackingLink(selectedOrder.id)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  data-testid="copy-tracking-link-btn"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link de Rastreio
                </Button>
                <Button
                  onClick={() => window.open(`/track/${selectedOrder.id}`, '_blank')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="view-tracking-btn"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Rastreio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientOrders;
