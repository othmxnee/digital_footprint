import React from 'react';
import './Paper.css'; 

function Paper(props) {
    return (
        <div className="paper">
            <h1>{props.title}</h1>
            <p>{props.text}</p> 
        </div>
    );
}

export default Paper;