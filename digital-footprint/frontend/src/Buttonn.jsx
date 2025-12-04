import React from 'react';
import './Buttonn.css';

const Buttonn = ({ text, onClick, disabled }) => {
    return (
        <button onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Buttonn;