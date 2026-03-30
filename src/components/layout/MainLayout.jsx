import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => (
  <div className="min-h-0 flex flex-col flex-1 bg-gradient-to-br from-blue-50 via-white to-primary-50">
    <Navbar />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
