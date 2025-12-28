import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    const [activeSection, setActiveSection] = useState('home');
    const location = useLocation();

    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Track active section on scroll
    useEffect(() => {
        if (location.pathname !== '/') return;

        const handleScroll = () => {
            const sections = ['home', 'device-scan', 'breach-check', 'security-tips'];
            const scrollPosition = window.scrollY + 100;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    // Only show navigation on home page
    if (location.pathname !== '/') {
        return (
            <div className='navbar'>
                <h2 className='navbar-title'>whoMi</h2>
            </div>
        );
    }

    return (
        <div className='navbar'>
            <h2 className='navbar-title'>whoMi</h2>
            <div className='navbar-rectanlge'>
                <ul className='navbar-list'>
                    <li
                        className={`navbar-item ${activeSection === 'home' ? 'navbar-item-active' : ''}`}
                        onClick={() => scrollToSection('home')}
                    >
                        Home
                    </li>
                    <li
                        className={`navbar-item ${activeSection === 'device-scan' ? 'navbar-item-active' : ''}`}
                        onClick={() => scrollToSection('device-scan')}
                    >
                        Device Scan
                    </li>
                    <li
                        className={`navbar-item ${activeSection === 'breach-check' ? 'navbar-item-active' : ''}`}
                        onClick={() => scrollToSection('breach-check')}
                    >
                        Data Breach Check
                    </li>
                    <li
                        className={`navbar-item ${activeSection === 'security-tips' ? 'navbar-item-active' : ''}`}
                        onClick={() => scrollToSection('security-tips')}
                    >
                        Security Tips
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default NavBar;