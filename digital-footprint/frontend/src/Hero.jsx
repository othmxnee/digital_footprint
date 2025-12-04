import React from 'react';
import heroImage from '/src/assets/hero.png'; 
import './Hero.css'; 
import Buttonn from './Buttonn'; 


function Hero() {
    console.log(heroImage);

    return (
        <div className="hero">
            <div className='hero-content'>
                <h1>Track Your Digital Footprint<br/>
                    with whoMi
                </h1>
                <p>See what the internet knows about you.</p>
                <Buttonn className='hero-button' text='Start scanning' />
                <div className='used'>
                    <img className='used-img' src='/src/assets/used.png'/>
                    <p className='used-text'>used whoMi</p>

                </div>

            </div>
            <div className='hero-image'>
                <img src= {heroImage} alt="Hero" />
            </div>

            
        </div>
    );
}

export default Hero;