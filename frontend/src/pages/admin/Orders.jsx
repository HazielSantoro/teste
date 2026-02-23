import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    material_id: '',
    file_name: '',
    quantity: 1,
    weight_grams: 0,
    notes: '',
    delivery_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes, materialsRes] = await Promise.all([
        axios.get(`${API}/orders`),
        axios.get(`${API}/clients`),
        axios.get(`${API}/materials`)
      ]);
      setOrders(ordersRes.data);
      setClients(clientsRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const params = new URLSearchParams({
        client_id: formData.client_id,
        material_id: formData.material_id,
        file_name: formData.file_name,
        quantity: formData.quantity.toString(),
        weight_grams: formData.weight_grams.toString(),
      });
      
      if (formData.notes) params.append('notes', formData.notes);
      if (formData.delivery_date) params.append('delivery_date', new Date(formData.delivery_date).toISOString());
      
      await axios.post(`${API}/orders/admin?${params.toString()}`);
      toast.success('Pedido criado com sucesso!');
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar pedido');
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const updateData = {
        status: selectedOrder.status,
        material_id: selectedOrder.material_id,
        quantity: selectedOrder.quantity,
        weight_grams: selectedOrder.weight_grams,
        notes: selectedOrder.notes,
        total_price: selectedOrder.total_price,
      };
      
      if (selectedOrder.delivery_date) {
        updateData.delivery_date = selectedOrder.delivery_date;
      }
      
      await axios.put(`${API}/orders/${selectedOrder.id}`, updateData);
      toast.success('Pedido atualizado com sucesso!');
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar pedido');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    
    try {
      await axios.delete(`${API}/orders/${orderId}`);
      toast.success('Pedido excluído com sucesso!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir pedido');
    }
  };

  const copyTrackingLink = (orderId) => {
    const link = `${window.location.origin}/track/${orderId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de rastreamento copiado!');
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      material_id: '',
      file_name: '',
      quantity: 1,
      weight_grams: 0,
      notes: '',
      delivery_date: '',
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.material_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculatePrice = () => {
    const material = materials.find(m => m.id === formData.material_id);
    if (!material) return 0;
    return (material.price_per_gram * formData.weight_grams * formData.quantity).toFixed(2);
  };

  if (loading) {
    return (
      <DashboardLayout title="Pedidos">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pedidos">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por cliente, ID ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-orders-input"
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-zinc-900/50 border-zinc-800 text-white" data-testid="status-filter-select">
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="create-order-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-['Manrope']">Criar Novo Pedido</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Cliente</Label>
                <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="select-client">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Material</Label>
                <Select value={formData.material_id} onValueChange={(v) => setFormData({...formData, material_id: v})}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="select-material">
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {materials.filter(m => m.available).map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - {material.color} (R$ {material.price_per_gram}/g)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Nome do Arquivo</Label>
                <Input
                  value={formData.file_name}
                  onChange={(e) => setFormData({...formData, file_name: e.target.value})}
                  placeholder="modelo.stl"
                  data-testid="input-file-name"
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    data-testid="input-quantity"
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Peso (gramas)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData({...formData, weight_grams: parseFloat(e.target.value) || 0})}
                    data-testid="input-weight"
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Data de Entrega</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                  data-testid="input-delivery-date"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Observações</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações adicionais..."
                  data-testid="input-notes"
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm text-zinc-400">Preço Estimado:</p>
                <p className="text-2xl font-bold text-orange-500 font-['JetBrains_Mono']">
                  R$ {calculatePrice()}
                </p>
              </div>
              <Button 
                onClick={handleCreateOrder}
                disabled={!formData.client_id || !formData.material_id || !formData.file_name || formData.weight_grams <= 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="submit-create-order"
              >
                Criar Pedido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">Cliente</TableHead>
                <TableHead className="text-zinc-400">Material</TableHead>
                <TableHead className="text-zinc-400">Arquivo</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Valor</TableHead>
                <TableHead className="text-zinc-400">Data</TableHead>
                <TableHead className="text-zinc-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-white">{order.client_name}</TableCell>
                    <TableCell className="text-zinc-300">{order.material_name}</TableCell>
                    <TableCell className="text-zinc-300 max-w-[150px] truncate">
                      {order.file_name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="font-mono text-green-500">
                      R$ {order.total_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {format(new Date(order.created_at), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem 
                            onClick={() => { setSelectedOrder(order); setIsViewOpen(true); }}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setSelectedOrder({...order}); setIsEditOpen(true); }}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => copyTrackingLink(order.id)}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Link
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/track/${order.id}`, '_blank')}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir Rastreio
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-['Manrope']">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">ID</p>
                  <p className="text-white font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Cliente</p>
                <p className="text-white">{selectedOrder.client_name}</p>
                <p className="text-sm text-zinc-400">{selectedOrder.client_email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Material</p>
                  <p className="text-white">{selectedOrder.material_name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Arquivo</p>
                  <p className="text-white truncate">{selectedOrder.file_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Quantidade</p>
                  <p className="text-white">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Peso</p>
                  <p className="text-white">{selectedOrder.weight_grams}g</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Valor</p>
                  <p className="text-green-500 font-mono">R$ {selectedOrder.total_price.toFixed(2)}</p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-zinc-500">Observações</p>
                  <p className="text-white">{selectedOrder.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Criado em</p>
                  <p className="text-white">
                    {format(new Date(selectedOrder.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {selectedOrder.delivery_date && (
                  <div>
                    <p className="text-xs text-zinc-500">Entrega</p>
                    <p className="text-white">
                      {format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-['Manrope']">Editar Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Status</Label>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(v) => setSelectedOrder({...selectedOrder, status: v})}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="edit-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="printing">Em Impressão</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Material</Label>
                <Select 
                  value={selectedOrder.material_id} 
                  onValueChange={(v) => setSelectedOrder({...selectedOrder, material_id: v})}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {materials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - {material.color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedOrder.quantity}
                    onChange={(e) => setSelectedOrder({...selectedOrder, quantity: parseInt(e.target.value) || 1})}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Peso (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={selectedOrder.weight_grams}
                    onChange={(e) => setSelectedOrder({...selectedOrder, weight_grams: parseFloat(e.target.value) || 0})}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Valor Total</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedOrder.total_price}
                  onChange={(e) => setSelectedOrder({...selectedOrder, total_price: parseFloat(e.target.value) || 0})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Observações</Label>
                <Input
                  value={selectedOrder.notes || ''}
                  onChange={(e) => setSelectedOrder({...selectedOrder, notes: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <Button 
                onClick={handleUpdateOrder}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="submit-edit-order"
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminOrders;
