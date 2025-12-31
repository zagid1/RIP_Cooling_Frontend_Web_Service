import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/CoolSystemHomePage';
import { ComponentsListPage } from './pages/ComponentsListPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersListPage } from './pages/OrdersListPage';
import { CoolingPage } from './pages/OrderPage';
import { ComponentsAdminPage } from './pages/ModeratorComponentsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import type { RootState } from './store';
import { useSelector } from 'react-redux';
import type { FC } from 'react';
import { ForbiddenPage } from './pages/ForbiddenPage';


const MainLayout = () => (
    <>
        <AppNavbar />
        <main className="main-content">
            <Outlet />
        </main>
    </>
);
const AdminRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isModerator = useSelector((state: RootState) => state.user.user?.moderator)
  
  if (!isModerator) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children}</>
}

function App() {
    return (
        <BrowserRouter> 
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />      
                <Route path="/register" element={<RegisterPage />} />  
                <Route element={<MainLayout />}>
                    <Route path="/components" element={<ComponentsListPage />} />
                    <Route path="/components/:id" element={<ComponentDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} /> 
                    <Route path="/cooling" element={<OrdersListPage />} />
                    <Route path="/cooling/:id" element={<CoolingPage />} />
                    {/* <Route path="/moderator/components" element={<ComponentsAdminPage />} /> */}
                </Route>
                <Route path= "/moderator/components"
                    element={
                        <AdminRoute>
                            <ComponentsAdminPage />
                        </AdminRoute>
                    } />
                <Route path="/forbidden" element={<ForbiddenPage />} />   
                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;