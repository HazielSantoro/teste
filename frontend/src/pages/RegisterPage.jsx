import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Printer, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        role: 'client',
      });
      toast.success(`Conta criada com sucesso! Bem-vindo, ${user.name}!`);
      navigate('/client');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center neon-glow">
            <Printer className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-['Manrope']">3D Print Master</h1>
            <p className="text-sm text-zinc-500">Sistema de Gestão</p>
          </div>
        </div>

        <Card className="glass border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-['Manrope'] text-white">Criar Conta</CardTitle>
            <CardDescription className="text-zinc-500">
              Preencha os dados para criar sua conta de cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  data-testid="register-name-input"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder:text-zinc-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="register-email-input"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder:text-zinc-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  data-testid="register-phone-input"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder:text-zinc-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-testid="register-password-input"
                    className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder:text-zinc-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  data-testid="register-confirm-password-input"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder:text-zinc-600"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="register-submit-btn"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
