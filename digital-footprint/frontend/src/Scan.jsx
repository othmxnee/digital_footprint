import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Buttonn from './Buttonn';
import Paper from './Paper';
import './Scan.css';
import { deviceScan, checkBreach } from './services/api';

const Scan = () => {
    // Device scan state
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceLoading, setDeviceLoading] = useState(false);
    const [deviceError, setDeviceError] = useState(null);
    const [scanMode, setScanMode] = useState('basic'); // 'basic' | 'advanced'

    // Breach check state
    const [emailInput, setEmailInput] = useState('');
    const [breachResult, setBreachResult] = useState(null);
    const [breachLoading, setBreachLoading] = useState(false);
    const [breachError, setBreachError] = useState(null);

    // Tips state
    const [tips, setTips] = useState([]);

    // Helper: Collect advanced fingerprint data
    const getAdvancedFingerprint = async () => {
        // 1. Canvas Fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("whoMi_Fingerprint", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("whoMi_Fingerprint", 4, 17);
        const canvasHash = canvas.toDataURL().slice(-50);

        // 2. GPU Detection
        let gpuModel = 'Unknown GPU';
        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpuModel = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) {
            console.warn('GPU detection failed', e);
        }

        // 3. AdBlock Detection - Enhanced with multiple methods
        let adBlockStatus = 'unknown'; // 'enabled', 'disabled', or 'unknown'
        try {
            // Method 1: Test with common ad-related class names
            const adTest = document.createElement('div');
            adTest.innerHTML = '&nbsp;';
            adTest.className = 'adsbox ad-banner advertisement';
            adTest.style.position = 'absolute';
            adTest.style.top = '-1000px';
            adTest.style.height = '1px';
            document.body.appendChild(adTest);

            // Wait for ad blockers to process
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check if element was hidden or removed
            const isHidden = adTest.offsetHeight === 0 ||
                adTest.offsetWidth === 0 ||
                window.getComputedStyle(adTest).display === 'none' ||
                window.getComputedStyle(adTest).visibility === 'hidden';

            if (isHidden) {
                adBlockStatus = 'enabled';
            } else {
                adBlockStatus = 'disabled';
            }

            document.body.removeChild(adTest);
        } catch (e) {
            console.warn('AdBlock detection failed', e);
            adBlockStatus = 'unknown';
        }

        // 4. Dark Mode
        const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 5. Browser Version & Security Check
        const ua = navigator.userAgent;
        let browserVersion = 'Unknown';
        let browserName = 'Unknown';
        let browserVersionNumber = 0;
        let isOutdated = false;

        try {
            const match = ua.match(/(Chrome|Firefox|Safari|Opera|Edg)\/(\d+)/);
            if (match) {
                browserName = match[1];
                browserVersionNumber = parseInt(match[2], 10);
                browserVersion = `${browserName} ${browserVersionNumber}`;

                // Simple heuristic: Check if browser is outdated
                const minVersions = {
                    'Chrome': 120,
                    'Firefox': 121,
                    'Safari': 17,
                    'Edg': 120,
                    'Opera': 106
                };

                if (minVersions[browserName] && browserVersionNumber < minVersions[browserName]) {
                    isOutdated = true;
                }
            }
        } catch (e) {
            console.warn('Version detection failed', e);
        }

        // 6. Calculate Entropy/Uniqueness Score
        let uniquenessScore = 'Low';
        let entropyBits = 0;

        const factors = [
            window.screen.width * window.screen.height > 2073600, // High resolution
            window.screen.colorDepth > 24, // High color depth
            navigator.hardwareConcurrency > 8, // Many CPU cores
            navigator.deviceMemory > 8, // High RAM
            gpuModel !== 'Unknown GPU' && !gpuModel.includes('SwiftShader'), // Real GPU detected
            navigator.plugins?.length > 5, // Many plugins
            darkMode, // Dark mode preference
            canvasHash.length > 0 // Canvas fingerprint available
        ];

        // Count unique factors
        entropyBits = factors.filter(Boolean).length * 2;

        if (entropyBits < 8) {
            uniquenessScore = 'Low';
        } else if (entropyBits < 14) {
            uniquenessScore = 'Medium';
        } else {
            uniquenessScore = 'High';
        }

        return {
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            color_depth: `${window.screen.colorDepth}-bit`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            hardware_concurrency: navigator.hardwareConcurrency,
            device_memory: navigator.deviceMemory,
            canvas_hash: canvasHash,
            gpu_model: gpuModel,
            ad_block_status: adBlockStatus,
            dark_mode: darkMode,
            browser_version: browserVersion,
            browser_outdated: isOutdated,
            uniqueness_score: uniquenessScore,
            entropy_bits: entropyBits
        };
    };

    // Generate tips based on device info
    useEffect(() => {
        if (deviceInfo) {
            const newTips = [];
            let idCounter = 1;

            if (window.location.protocol !== 'https:') {
                newTips.push({
                    number: idCounter++,
                    title: 'Use HTTPS',
                    text: 'Your connection is not encrypted. Always use HTTPS websites.'
                });
            }

            const browser = deviceInfo.browser?.toLowerCase() || '';
            if (browser.includes('chrome')) {
                newTips.push({
                    number: idCounter++,
                    title: 'Consider Firefox',
                    text: 'Chrome tracks extensive telemetry. Firefox is more privacy-focused.'
                });
            }

            const os = deviceInfo.os?.toLowerCase() || '';
            if (os.includes('windows')) {
                newTips.push({
                    number: idCounter++,
                    title: 'Windows Privacy',
                    text: 'Review your Windows privacy settings to limit data collection.'
                });
            }

            if (deviceInfo.ip_address && deviceInfo.ip_address !== '127.0.0.1') {
                newTips.push({
                    number: idCounter++,
                    title: 'Hide Your IP',
                    text: 'Your ISP tracks your activity. Consider using a VPN.'
                });
            }

            if (deviceInfo.is_advanced) {
                if (deviceInfo.ad_block_status === 'disabled') {
                    newTips.push({
                        number: idCounter++,
                        title: 'Install AdBlock',
                        text: 'No AdBlock detected. Install uBlock Origin to block ads and trackers.'
                    });
                } else if (deviceInfo.ad_block_status === 'enabled') {
                    newTips.push({
                        number: idCounter++,
                        title: 'AdBlock Active',
                        text: 'Great! Your AdBlock is protecting you from trackers and malicious ads.'
                    });
                }

                if (deviceInfo.browser_outdated) {
                    newTips.push({
                        number: idCounter++,
                        title: 'Update Browser Now',
                        text: `Your ${deviceInfo.browser_version} is outdated. Update immediately to patch security vulnerabilities.`
                    });
                } else if (deviceInfo.browser_version && deviceInfo.browser_version !== 'Unknown') {
                    newTips.push({
                        number: idCounter++,
                        title: 'Browser Up to Date',
                        text: `${deviceInfo.browser_version} appears current. Keep auto-updates enabled.`
                    });
                }

                if (deviceInfo.gpu_model && deviceInfo.gpu_model !== 'Unknown GPU' && !deviceInfo.gpu_model.includes('SwiftShader')) {
                    newTips.push({
                        number: idCounter++,
                        title: 'GPU Fingerprinting Risk',
                        text: `Your GPU (${deviceInfo.gpu_model.substring(0, 30)}...) can uniquely identify you. Consider privacy extensions.`
                    });
                }

                if (deviceInfo.dark_mode !== undefined) {
                    newTips.push({
                        number: idCounter++,
                        title: 'Theme Preference Tracked',
                        text: `Your ${deviceInfo.dark_mode ? 'dark' : 'light'} mode preference adds to your fingerprint.`
                    });
                }

                if (deviceInfo.uniqueness_score === 'High') {
                    newTips.push({
                        number: idCounter++,
                        title: 'Highly Unique Device',
                        text: 'Your device fingerprint is very unique, making you easy to track. Use Tor Browser for anonymity.'
                    });
                } else if (deviceInfo.uniqueness_score === 'Medium') {
                    newTips.push({
                        number: idCounter++,
                        title: 'Moderate Uniqueness',
                        text: 'Your fingerprint has moderate uniqueness. Privacy extensions can help reduce tracking.'
                    });
                }
            } else {
                if (newTips.length < 2) {
                    newTips.push({
                        number: idCounter++,
                        title: 'Block Trackers',
                        text: 'Install uBlock Origin to block ads and trackers.'
                    });
                }
            }

            setTips(newTips);
        } else {
            setTips([
                { number: 1, title: 'Use a VPN', text: 'Hide your IP address from trackers.' },
                { number: 2, title: 'Update Browser', text: 'Keep your browser updated for security.' },
                { number: 3, title: 'Strong Passwords', text: 'Use a password manager.' },
                { number: 4, title: '2FA', text: 'Enable Two-Factor Authentication everywhere.' }
            ]);
        }
    }, [deviceInfo]);

    const handleDeviceScan = async () => {
        setDeviceLoading(true);
        setDeviceError(null);
        setDeviceInfo(null);

        try {
            const data = await deviceScan();
            let info = data.device_info;

            if (scanMode === 'advanced') {
                const advancedData = await getAdvancedFingerprint();
                info = { ...info, ...advancedData, is_advanced: true };
            }

            setDeviceInfo(info);
        } catch (error) {
            setDeviceError(error.message || 'Failed to scan device');
        } finally {
            setDeviceLoading(false);
        }
    };

    const handleBreachCheck = async () => {
        if (!emailInput.trim()) {
            setBreachError('Please enter an email address');
            return;
        }

        if (!emailInput.includes('@')) {
            setBreachError('Please enter a valid email address');
            return;
        }

        setBreachLoading(true);
        setBreachError(null);
        setBreachResult(null);

        try {
            const data = await checkBreach(emailInput);
            setBreachResult(data);
        } catch (error) {
            setBreachError(error.message || 'Breach check failed');
        } finally {
            setBreachLoading(false);
        }
    };

    return (
        <div className='scan-container'>
            {/* Device Scan Section */}
            <div id="device-scan" className="scan-section device-scan-section">
                <div className="section-header">
                    <h2>Device Fingerprint Scan</h2>
                    <p>Discover what information your device reveals</p>
                </div>

                <div className="scan-mode-toggle">
                    <label className={`mode-option ${scanMode === 'basic' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="scanMode"
                            value="basic"
                            checked={scanMode === 'basic'}
                            onChange={() => setScanMode('basic')}
                        />
                        Basic Scan
                    </label>
                    <label className={`mode-option ${scanMode === 'advanced' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="scanMode"
                            value="advanced"
                            checked={scanMode === 'advanced'}
                            onChange={() => setScanMode('advanced')}
                        />
                        Advanced Scan
                    </label>
                </div>

                {scanMode === 'advanced' && (
                    <div className="advanced-warning">
                        <div className="warning-header">Advanced Scan Notice</div>
                        <small>
                            Advanced scanning reveals more metadata used by trackers including:
                            <strong> GPU model, AdBlock status, theme preference, browser version, screen details, timezone, and language.</strong>
                            <br />
                            This information is <strong>NOT stored</strong> and only used to show you local security insights.
                        </small>
                    </div>
                )}

                <div className="scan-action">
                    <Buttonn
                        text={deviceLoading ? 'Scanning...' : 'Scan My Device'}
                        onClick={handleDeviceScan}
                        disabled={deviceLoading}
                    />
                </div>

                <div className="privacy-trust">
                    <span>Your data is only checked, never stored. <Link to="/privacy">Read Privacy Policy</Link></span>
                </div>

                {deviceError && (
                    <div className="result-card error-card">
                        <div className="card-content">
                            <h3>Error</h3>
                            <p>{deviceError}</p>
                        </div>
                    </div>
                )}

                {deviceInfo && (
                    <div className="result-card success-card">
                        <div className="card-header">
                            <h3>Device Information Detected</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">IP Address:</span>
                                <span className="info-value">{deviceInfo.ip_address}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Device:</span>
                                <span className="info-value">{deviceInfo.device_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Browser:</span>
                                <span className="info-value">{deviceInfo.browser}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">OS:</span>
                                <span className="info-value">{deviceInfo.os}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Type:</span>
                                <span className="info-value">{deviceInfo.device_type}</span>
                            </div>

                            {deviceInfo.is_advanced && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">Screen:</span>
                                        <span className="info-value">{deviceInfo.screen_resolution}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Timezone:</span>
                                        <span className="info-value">{deviceInfo.timezone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Language:</span>
                                        <span className="info-value">{deviceInfo.language}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">GPU Model:</span>
                                        <span className="info-value">
                                            {deviceInfo.gpu_model && deviceInfo.gpu_model.length > 40
                                                ? deviceInfo.gpu_model.substring(0, 40) + '...'
                                                : deviceInfo.gpu_model || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">AdBlock:</span>
                                        <span className="info-value">
                                            {deviceInfo.ad_block_status === 'enabled' ? 'Enabled' :
                                                deviceInfo.ad_block_status === 'disabled' ? 'Not Detected' :
                                                    'Cannot determine'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Theme Preference:</span>
                                        <span className="info-value">
                                            {deviceInfo.dark_mode ? 'Dark Mode' : 'Light Mode'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Browser Version:</span>
                                        <span className="info-value">
                                            {deviceInfo.browser_version}
                                            {deviceInfo.browser_outdated && (
                                                <span style={{ color: '#dc3545', fontWeight: 'bold' }}> (Outdated)</span>
                                            )}
                                            {!deviceInfo.browser_outdated && deviceInfo.browser_version !== 'Unknown' && (
                                                <span style={{ color: '#28a745' }}> (Up to date)</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="info-item uniqueness-item">
                                        <span className="info-label">Uniqueness Score:</span>
                                        <span className={`info-value uniqueness-${deviceInfo.uniqueness_score?.toLowerCase()}`}>
                                            {deviceInfo.uniqueness_score || 'Unknown'}
                                            <small style={{ display: 'block', fontSize: '0.85em', marginTop: '0.25rem' }}>
                                                (~{deviceInfo.entropy_bits || 0} bits of entropy)
                                            </small>
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="info-item">
                                <span className="info-label">Scan Time:</span>
                                <span className="info-value">
                                    {new Date(deviceInfo.scan_time).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Email Breach Check Section */}
            <div id="breach-check" className="scan-section breach-check-section">
                <div className="section-header">
                    <h2>Data Breach Checker</h2>
                    <p>Check if your email has been compromised in known data breaches</p>
                </div>

                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleBreachCheck()}
                        className="email-input"
                    />
                    <Buttonn
                        text={breachLoading ? 'Checking...' : 'Check Breaches'}
                        onClick={handleBreachCheck}
                        disabled={breachLoading}
                    />
                </div>

                <div className="privacy-trust">
                    <span>Your email is only checked, never stored. <Link to="/privacy">Read Privacy Policy</Link></span>
                </div>

                {breachError && (
                    <div className="result-card error-card">
                        <div className="card-content">
                            <h3>Error</h3>
                            <p>{breachError}</p>
                        </div>
                    </div>
                )}

                {breachResult && (
                    <div className={`result-card ${breachResult.breaches.length === 0 ? 'success-card' : 'warning-card'}`}>
                        <div className="card-header">
                            <h3>
                                {breachResult.breaches.length === 0
                                    ? 'No Breaches Found!'
                                    : `Found ${breachResult.breaches.length} Breach${breachResult.breaches.length > 1 ? 'es' : ''}`
                                }
                            </h3>
                        </div>
                        <div className="card-content">
                            <p className="breach-email">
                                <strong>Email:</strong> {breachResult.email}
                            </p>

                            {breachResult.breaches.length === 0 ? (
                                <p className="breach-message">
                                    Good news! Your email address hasn't appeared in any known data breaches.
                                </p>
                            ) : (
                                <div className="breach-list">
                                    {breachResult.breaches.map((breach, index) => (
                                        <div key={index} className="breach-item">
                                            <h4>{breach.name}</h4>
                                            <p><strong>Date:</strong> {breach.date}</p>
                                            <p><strong>Compromised Data:</strong> {breach.leaked_data.join(', ')}</p>
                                        </div>
                                    ))}
                                    <div className="breach-advice">
                                        <strong>Recommendation:</strong>
                                        <p>Change your password immediately for affected accounts. Enable two-factor authentication.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- UPDATED TIPS SECTION WITH INLINE STYLES FOR CENTERING --- */}
            <div id="security-tips" style={{
                marginTop: '100px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',    /* Centers everything horizontally */
                textAlign: 'center',
                paddingBottom: '50px'
            }}>
                <div className="section-header" style={{ marginBottom: '40px' }}>
                    <h2>Security Tips for You</h2>
                    <p>{deviceInfo ? 'Personalized recommendations based on your scan' : 'General best practices for digital privacy'}</p>
                </div>

                {/* Vertical Stack Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column', /* Stacks cards vertically */
                    gap: '40px',             /* Space between cards */
                    alignItems: 'center',    /* Centers the cards */
                    width: '100%'
                }}>
                    {tips.map((tip) => (
                        <div key={tip.number} style={{
                            position: 'relative',
                            width: '90%',        /* Responsive width */
                            maxWidth: '600px',   /* Limits width to look like a wide card */
                            margin: '0 auto'     /* Extra safety to center */
                        }}>
                            {/* Badge Number - Using Neon Green #ccff00 */}
                            <span style={{
                                position: 'absolute',
                                top: '-15px',
                                left: '-10px',
                                backgroundColor: '#ccff00', 
                                color: 'black',
                                fontWeight: '800',
                                fontSize: '1.2rem',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                boxShadow: '3px 3px 0 black',
                                zIndex: 10,
                                border: '2px solid black'
                            }}>
                                {tip.number}
                            </span>

                            {/* Wrapper to ensure Paper fills the space */}
                            <div style={{ width: '100%' }}>
                                <Paper className='papers' title={tip.title} text={tip.text} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* --- END UPDATED SECTION --- */}
        </div>
    );
};

export default Scan;