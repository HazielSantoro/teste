import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, MoreVertical, Eye, Trash2, Package, Mail, Phone } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/clients`),
        axios.get(`${API}/orders`)
      ]);
      setClients(clientsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Todos os pedidos dele também serão excluídos.')) return;
    
    try {
      await axios.delete(`${API}/clients/${clientId}`);
      toast.success('Cliente excluído com sucesso!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir cliente');
    }
  };

  const getClientStats = (clientId) => {
    const clientOrders = orders.filter(o => o.client_id === clientId);
    const totalSpent = clientOrders.reduce((sum, o) => {
      if (o.status === 'completed' || o.status === 'delivered') {
        return sum + o.total_price;
      }
      return sum;
    }, 0);
    return {
      totalOrders: clientOrders.length,
      totalSpent: totalSpent
    };
  };

  const getClientOrders = (clientId) => {
    return orders.filter(o => o.client_id === clientId);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Clientes">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clientes">
      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-clients-input"
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Total de Clientes</p>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Clientes Ativos</p>
            <p className="text-2xl font-bold text-green-500">
              {clients.filter(c => getClientStats(c.id).totalOrders > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Novos este Mês</p>
            <p className="text-2xl font-bold text-orange-500">
              {clients.filter(c => {
                const created = new Date(c.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Telefone</TableHead>
                <TableHead className="text-zinc-400">Pedidos</TableHead>
                <TableHead className="text-zinc-400">Total Gasto</TableHead>
                <TableHead className="text-zinc-400">Cadastro</TableHead>
                <TableHead className="text-zinc-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-500 py-8">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const stats = getClientStats(client.id);
                  return (
                    <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{client.name}</TableCell>
                      <TableCell className="text-zinc-300">{client.email}</TableCell>
                      <TableCell className="text-zinc-300">{client.phone || '-'}</TableCell>
                      <TableCell className="text-white">{stats.totalOrders}</TableCell>
                      <TableCell className="font-mono text-green-500">
                        R$ {stats.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {format(new Date(client.created_at), 'dd/MM/yy', { locale: ptBR })}
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
                              onClick={() => { setSelectedClient(client); setIsViewOpen(true); }}
                              className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Client Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-['Manrope']">Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 mt-4">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="text-white">{selectedClient.email}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Telefone</span>
                  </div>
                  <p className="text-white">{selectedClient.phone || 'Não informado'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Total de Pedidos</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {getClientStats(selectedClient.id).totalOrders}
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm text-zinc-500 mb-1">Total Gasto</p>
                  <p className="text-2xl font-bold text-green-500 font-mono">
                    R$ {getClientStats(selectedClient.id).totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Pedidos Recentes</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getClientOrders(selectedClient.id).slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                      <div>
                        <p className="text-white text-sm">{order.file_name}</p>
                        <p className="text-xs text-zinc-500">{order.material_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-mono text-sm">R$ {order.total_price.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(order.created_at), 'dd/MM/yy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {getClientOrders(selectedClient.id).length === 0 && (
                    <p className="text-zinc-500 text-sm text-center py-4">Nenhum pedido</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminClients;
