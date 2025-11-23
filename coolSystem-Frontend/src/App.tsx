import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/CoolSystemHomePage';
import { ComponentsListPage } from './pages/ComponentsListPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';

const MainLayout = () => (
    <>
        <AppNavbar />
        <main className="main-content">
            <Outlet />
        </main>
    </>
);

//const appBaseName = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;

function App() {
    return (
        <BrowserRouter /*basename={appBaseName}*/> 
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