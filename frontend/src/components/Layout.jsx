import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;
