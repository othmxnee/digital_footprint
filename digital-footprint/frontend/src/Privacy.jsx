import React from 'react';
import { Link } from 'react-router-dom';
import './Scan.css'; // Reusing existing styles for consistency

const Privacy = () => {
    return (
        <div className="scan-container">
            <div className="scan-section">
                <div className="section-header">
                    <h2>🔒 Privacy Policy</h2>
                    <p>Transparency is our priority.</p>
                </div>

                <div className="card-content" style={{ textAlign: 'left' }}>
                    <h3>1. Data Collection</h3>
                    <p>
                        We only collect the data necessary to perform the requested scans.
                        This includes your IP address, browser user agent, and any email address you explicitly provide for breach checking.
                    </p>

                    <h3>2. Data Storage</h3>
                    <p>
                        <strong>We do not store your personal data.</strong>
                        Scan results are processed in memory and returned to you.
                        We do not build profiles or sell your information.
                    </p>

                    <h3>3. Third-Party Services</h3>
                    <p>
                        For breach checks, we query the Have I Been Pwned API.
                        We send only the necessary hash or email to check for breaches.
                    </p>

                    <h3>4. Open Source</h3>
                    <p>
                        This project is open source. You can inspect the code to verify our claims.
                    </p>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link to="/" style={{
                            textDecoration: 'none',
                            color: 'black',
                            fontWeight: 'bold',
                            border: '2px solid black',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            display: 'inline-block'
                        }}>
                            ← Back to Scanner
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
