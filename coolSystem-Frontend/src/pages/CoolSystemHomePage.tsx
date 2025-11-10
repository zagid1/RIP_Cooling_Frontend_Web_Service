import { AppNavbar } from '../components/Navbar';
import './styles/HomePage.css';

export const HomePage = () => {
    return (
        <div className="homepage-wrapper">
            <AppNavbar />

            <div className="home-page-container">
                {/* <video autoPlay loop muted playsInline className="home-video-background">
                    <source src="/Background.mp4" type="video/mp4" />
                    Ваш браузер не поддерживает видео-тег.
                </video> */}

                <div className="home-page-content">
                    <h1>Добро пожаловать в CoolingSystems!</h1>
                    <p className="lead fs-4">Этот сервис предназначен для расчета требуемой мощности системы охлаждения серверного оборудования.</p>
                </div>
            </div>
        </div>
    );
};