import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/CoolSystemHomePage';
import { ComponentsListPage } from './pages/ComponentsListPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';

const MainLayout = () => (
    <>
        <AppNavbar />
        <main>
            <Outlet />
        </main>
    </>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route element={<MainLayout />}>
                    <Route path="/components" element={<ComponentsListPage />} />
                    <Route path="/components/:id" element={<ComponentDetailPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;