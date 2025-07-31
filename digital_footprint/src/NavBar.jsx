import React from 'react';
import './NavBar.css'; 

const NavBar = () => {
    return (
        <div className='navbar'>
            <h2 className='navbar-title'>whoMi</h2>
            <div className='navbar-rectanlge'>
                <ul className='navbar-list'>
                    <li className='navbar-item-home'>Home</li>
                    <li className='navbar-item'>Ai-prediction</li>
                    <li className='navbar-item'>Tips</li>
                    <li className='navbar-item'>About</li>
                </ul>
            </div>
            
        </div>
    );
};

export default NavBar;