import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, Trash2, Check, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    price_per_gram: 0,
    description: '',
    available: true,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API}/materials`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    try {
      await axios.post(`${API}/materials`, formData);
      toast.success('Material criado com sucesso!');
      setIsCreateOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar material');
    }
  };

  const handleUpdateMaterial = async () => {
    try {
      await axios.put(`${API}/materials/${selectedMaterial.id}`, {
        name: selectedMaterial.name,
        color: selectedMaterial.color,
        price_per_gram: selectedMaterial.price_per_gram,
        description: selectedMaterial.description,
        available: selectedMaterial.available,
      });
      toast.success('Material atualizado com sucesso!');
      setIsEditOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      await axios.delete(`${API}/materials/${materialId}`);
      toast.success('Material excluído com sucesso!');
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir material');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '',
      price_per_gram: 0,
      description: '',
      available: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Materiais">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Materiais">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-zinc-400">
          Gerencie os materiais disponíveis para impressão 3D
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="create-material-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white font-['Manrope']">Adicionar Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: PLA, ABS, PETG..."
                  data-testid="input-material-name"
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Cor</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="Ex: Preto, Branco, Vermelho..."
                  data-testid="input-material-color"
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Preço por Grama (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_gram}
                  onChange={(e) => setFormData({...formData, price_per_gram: parseFloat(e.target.value) || 0})}
                  data-testid="input-material-price"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrição opcional..."
                  data-testid="input-material-description"
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Disponível</Label>
                <Switch
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({...formData, available: checked})}
                  data-testid="switch-material-available"
                />
              </div>
              <Button 
                onClick={handleCreateMaterial}
                disabled={!formData.name || !formData.color || formData.price_per_gram <= 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="submit-create-material"
              >
                Criar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {materials.map((material) => (
          <Card key={material.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{material.name}</h3>
                  <p className="text-sm text-zinc-400">{material.color}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                    <DropdownMenuItem 
                      onClick={() => { setSelectedMaterial({...material}); setIsEditOpen(true); }}
                      className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Preço/grama</span>
                  <span className="text-lg font-bold text-orange-500 font-['JetBrains_Mono']">
                    R$ {material.price_per_gram.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Status</span>
                  <span className={`inline-flex items-center gap-1 text-sm ${material.available ? 'text-green-500' : 'text-red-500'}`}>
                    {material.available ? (
                      <>
                        <Check className="w-4 h-4" />
                        Disponível
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Indisponível
                      </>
                    )}
                  </span>
                </div>
                
                {material.description && (
                  <p className="text-sm text-zinc-500 pt-2 border-t border-zinc-800">
                    {material.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Materials Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Material</TableHead>
                <TableHead className="text-zinc-400">Cor</TableHead>
                <TableHead className="text-zinc-400">Preço/g</TableHead>
                <TableHead className="text-zinc-400">Descrição</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    Nenhum material cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{material.name}</TableCell>
                    <TableCell className="text-zinc-300">{material.color}</TableCell>
                    <TableCell className="font-mono text-orange-500">
                      R$ {material.price_per_gram.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-zinc-400 max-w-[200px] truncate">
                      {material.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-sm ${material.available ? 'text-green-500' : 'text-red-500'}`}>
                        {material.available ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </span>
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
                            onClick={() => { setSelectedMaterial({...material}); setIsEditOpen(true); }}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-800"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMaterial(material.id)}
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

      {/* Edit Material Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white font-['Manrope']">Editar Material</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Nome</Label>
                <Input
                  value={selectedMaterial.name}
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, name: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Cor</Label>
                <Input
                  value={selectedMaterial.color}
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, color: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Preço por Grama (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedMaterial.price_per_gram}
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, price_per_gram: parseFloat(e.target.value) || 0})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Descrição</Label>
                <Input
                  value={selectedMaterial.description || ''}
                  onChange={(e) => setSelectedMaterial({...selectedMaterial, description: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Disponível</Label>
                <Switch
                  checked={selectedMaterial.available}
                  onCheckedChange={(checked) => setSelectedMaterial({...selectedMaterial, available: checked})}
                />
              </div>
              <Button 
                onClick={handleUpdateMaterial}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="submit-edit-material"
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

export default AdminMaterials;
