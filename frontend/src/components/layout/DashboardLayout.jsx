import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="grid-bg min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 glass border-b border-zinc-800 px-8 py-4">
            <h1 className="text-2xl font-bold text-white font-['Manrope']">{title}</h1>
          </header>
          
          {/* Content */}
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
