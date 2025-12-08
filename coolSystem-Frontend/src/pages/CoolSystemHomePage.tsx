import { AppNavbar } from '../components/Navbar';
import './styles/HomePage.css';

export const HomePage = () => {
    return (
        <div className="homepage-wrapper">
            <AppNavbar />

            <div className="home-page-container">

                <div className="home-page-content">
                    <h1>Добро пожаловать в CoolingSystems!</h1>
                    <p className="lead fs-4">Этот сервис предназначен для расчета требуемой мощности системы охлаждения серверного оборудования.</p>
                </div>
            </div>
        </div>
    );
};