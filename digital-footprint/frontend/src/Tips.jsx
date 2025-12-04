import React from 'react';
import Paper from './Paper'; // adjust the path if needed
import './Tips.css';

const tipsData = [
    { number: 1, title: 'Use Https', text: 'and Vpn' },
    { number: 2, title: 'Use Https', text: 'and Vpn' },
    { number: 3, title: 'Use Https', text: 'and Vpn' },
    { number: 4, title: 'Use Https', text: 'and Vpn' },
];

const Tips = () => {
    return (
        <div className="tips">
        <h1>tips for better security</h1>
        <div className="tips-grid">
            {tipsData.map((tip) => (
                <div className="paper-wrapper" key={tip.number}>
                    <span className="paper-badge">{tip.number}</span>
                    <Paper className='papers' title={tip.title} text={tip.text}/>
                </div>
            ))}
        </div>
        </div>
    );
};

export default Tips;
