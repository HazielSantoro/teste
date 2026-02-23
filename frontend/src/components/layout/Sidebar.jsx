import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Boxes, 
  LogOut,
  Printer,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Pedidos', icon: Package },
    { href: '/admin/clients', label: 'Clientes', icon: Users },
    { href: '/admin/materials', label: 'Materiais', icon: Boxes },
  ];

  const clientLinks = [
    { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/client/orders', label: 'Meus Pedidos', icon: Package },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-zinc-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link to={isAdmin ? '/admin' : '/client'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white font-['Manrope']">3D Print</h1>
            <p className="text-xs text-zinc-500">Master</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              to={link.href}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/30" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 font-medium">{link.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-sm font-semibold text-orange-500">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          data-testid="logout-btn"
          className="w-full mt-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
