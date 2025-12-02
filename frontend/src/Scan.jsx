import React from 'react';
import Buttonn from './Buttonn';
import Paper from './Paper';
import './Scan.css'; 


const Scan = () => {
    return (<div className='scan-container'>
        <div className="scan">
            <Buttonn text='Scan'/>
            <Paper text='hhhhhh' className='scan-paper' />            
        </div>
        <div className='Email'>
            <h1>Check your email for past data breaches</h1>
            <div className='input-button'>
                <input type="email" placeholder="Enter your email" />
                <Buttonn text='Check' />
            </div>
        </div>
        <div className='ai'>
            <h1> 🤖  AI-Based Profile Prediction</h1>
            <div className='input-button-ai'>
            <input type='text' placeholder='✍️  I just finished building a privacy tool!'/>
            <Buttonn text='Analyze' />

            </div>
            
            <Paper title='Based on your text, the AI thinks:'></Paper>

        </div>
        </div>
        
    );
};

export default Scan;