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

        // 3. AdBlock Detection
        let adBlockEnabled = false;
        try {
            const adTest = document.createElement('div');
            adTest.innerHTML = '&nbsp;';
            adTest.className = 'adsbox';
            adTest.style.position = 'absolute';
            adTest.style.top = '-1000px';
            document.body.appendChild(adTest);
            // Wait a tick for styles to apply
            await new Promise(resolve => setTimeout(resolve, 100));
            if (adTest.offsetHeight === 0) {
                adBlockEnabled = true;
            }
            document.body.removeChild(adTest);
        } catch (e) {
            console.warn('AdBlock detection failed', e);
        }

        // 4. Dark Mode
        const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 5. Browser Version
        const ua = navigator.userAgent;
        let browserVersion = 'Unknown';
        try {
            const match = ua.match(/(Chrome|Firefox|Safari|Opera|Edg)\/(\d+)/);
            if (match) {
                browserVersion = `${match[1]} ${match[2]}`;
            }
        } catch (e) {
            console.warn('Version detection failed', e);
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
            ad_block: adBlockEnabled,
            dark_mode: darkMode,
            browser_version: browserVersion
        };
    };

    // Generate tips based on device info
    useEffect(() => {
        if (deviceInfo) {
            const newTips = [];
            let idCounter = 1;

            // Check 1: HTTPS (Frontend check)
            if (window.location.protocol !== 'https:') {
                newTips.push({
                    number: idCounter++,
                    title: 'Use HTTPS',
                    text: 'Your connection is not encrypted. Always use HTTPS websites.'
                });
            }

            // Check 2: Browser Privacy
            const browser = deviceInfo.browser?.toLowerCase() || '';
            if (browser.includes('chrome')) {
                newTips.push({
                    number: idCounter++,
                    title: 'Consider Firefox',
                    text: 'Chrome tracks extensive telemetry. Firefox is more privacy-focused.'
                });
            }

            // Check 3: OS Privacy
            const os = deviceInfo.os?.toLowerCase() || '';
            if (os.includes('windows')) {
                newTips.push({
                    number: idCounter++,
                    title: 'Windows Privacy',
                    text: 'Review your Windows privacy settings to limit data collection.'
                });
            }

            // Check 4: Public IP
            if (deviceInfo.ip_address && deviceInfo.ip_address !== '127.0.0.1') {
                newTips.push({
                    number: idCounter++,
                    title: 'Hide Your IP',
                    text: 'Your ISP tracks your activity. Consider using a VPN.'
                });
            }

            // Advanced Checks
            if (deviceInfo.is_advanced) {
                // Check 5: AdBlock
                if (!deviceInfo.ad_block) {
                    newTips.push({
                        number: idCounter++,
                        title: 'Block Trackers',
                        text: 'No AdBlock detected. Install uBlock Origin to stop trackers.'
                    });
                }

                // Check 6: Browser Version (Simple heuristic)
                if (deviceInfo.browser_version && deviceInfo.browser_version !== 'Unknown') {
                    // This is a very basic check, in production you'd compare against latest versions
                    // For now, we just advise keeping it updated
                    newTips.push({
                        number: idCounter++,
                        title: 'Update Browser',
                        text: `Ensure ${deviceInfo.browser_version} is up to date to patch vulnerabilities.`
                    });
                }

                // Check 7: GPU Fingerprinting
                if (deviceInfo.gpu_model && deviceInfo.gpu_model !== 'Unknown GPU') {
                    newTips.push({
                        number: idCounter++,
                        title: 'GPU Fingerprint',
                        text: 'Your GPU model can be used to track you across the web.'
                    });
                }
            } else {
                // Default tip if basic scan and few tips found
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
            // Default tips before scan
            setTips([
                { number: 1, title: 'Use a VPN', text: 'Hide your IP address from trackers.' },
                { number: 2, title: 'Update Browser', text: 'Keep your browser updated for security.' },
                { number: 3, title: 'Strong Passwords', text: 'Use a password manager.' },
                { number: 4, title: '2FA', text: 'Enable Two-Factor Authentication everywhere.' }
            ]);
        }
    }, [deviceInfo]);

    // Handle Device Scan (no input required)
    const handleDeviceScan = async () => {
        setDeviceLoading(true);
        setDeviceError(null);
        setDeviceInfo(null);

        try {
            // Basic scan first
            const data = await deviceScan();
            let info = data.device_info;

            // If advanced mode, collect and merge extra data
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

    // Handle Breach Check
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
            <div className="scan-section device-scan-section">
                <div className="section-header">
                    <h2>🔍 Device Fingerprint Scan</h2>
                    <p>Discover what information your device reveals</p>
                </div>

                {/* Scan Mode Toggle */}
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
                        <small>⚠️ Advanced scan reveals more metadata (Canvas, Screen, Timezone). This info is NOT stored.</small>
                    </div>
                )}

                <div className="scan-action">
                    <Buttonn
                        text={deviceLoading ? '🔄 Scanning...' : '🚀 Scan My Device'}
                        onClick={handleDeviceScan}
                        disabled={deviceLoading}
                    />
                </div>

                {/* Privacy Trust Message */}
                <div className="privacy-trust">
                    <span className="lock-icon">🔒</span>
                    <span>Your data is only checked, never stored. <Link to="/privacy">Read Privacy Policy</Link></span>
                </div>

                {deviceError && (
                    <div className="result-card error-card">
                        <div className="card-icon">❌</div>
                        <div className="card-content">
                            <h3>Error</h3>
                            <p>{deviceError}</p>
                        </div>
                    </div>
                )}

                {deviceInfo && (
                    <div className="result-card success-card">
                        <div className="card-header">
                            <div className="card-icon">✅</div>
                            <h3>Device Information Detected</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">🌐 IP Address:</span>
                                <span className="info-value">{deviceInfo.ip_address}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">💻 Device:</span>
                                <span className="info-value">{deviceInfo.device_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">🌍 Browser:</span>
                                <span className="info-value">{deviceInfo.browser}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">🖥️ OS:</span>
                                <span className="info-value">{deviceInfo.os}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">📱 Type:</span>
                                <span className="info-value">{deviceInfo.device_type}</span>
                            </div>

                            {deviceInfo.is_advanced && (
                                <>
                                    <div className="info-item">
                                        <span className="info-label">📏 Screen:</span>
                                        <span className="info-value">{deviceInfo.screen_resolution}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">🕒 Timezone:</span>
                                        <span className="info-value">{deviceInfo.timezone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">🗣️ Language:</span>
                                        <span className="info-value">{deviceInfo.language}</span>
                                    </div>
                                </>
                            )}

                            <div className="info-item">
                                <span className="info-label">⏰ Scan Time:</span>
                                <span className="info-value">
                                    {new Date(deviceInfo.scan_time).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="info-note">
                            <small>ℹ️ {deviceInfo.note}</small>
                        </div>
                    </div>
                )}
            </div>

            {/* Email Breach Check Section */}
            <div className="scan-section breach-check-section">
                <div className="section-header">
                    <h2>🔓 Data Breach Checker</h2>
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
                        text={breachLoading ? '⏳ Checking...' : '🔍 Check Breaches'}
                        onClick={handleBreachCheck}
                        disabled={breachLoading}
                    />
                </div>

                {/* Privacy Trust Message */}
                <div className="privacy-trust">
                    <span className="lock-icon">🔒</span>
                    <span>Your email is only checked, never stored. <Link to="/privacy">Read Privacy Policy</Link></span>
                </div>

                {breachError && (
                    <div className="result-card error-card">
                        <div className="card-icon">❌</div>
                        <div className="card-content">
                            <h3>Error</h3>
                            <p>{breachError}</p>
                        </div>
                    </div>
                )}

                {breachResult && (
                    <div className={`result-card ${breachResult.breaches.length === 0 ? 'success-card' : 'warning-card'}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {breachResult.breaches.length === 0 ? '🛡️' : '⚠️'}
                            </div>
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
                                    ✅ Good news! Your email address hasn't appeared in any known data breaches.
                                </p>
                            ) : (
                                <div className="breach-list">
                                    {breachResult.breaches.map((breach, index) => (
                                        <div key={index} className="breach-item">
                                            <h4>🔴 {breach.name}</h4>
                                            <p><strong>Date:</strong> {breach.date}</p>
                                            <p><strong>Compromised Data:</strong> {breach.leaked_data.join(', ')}</p>
                                        </div>
                                    ))}
                                    <div className="breach-advice">
                                        <strong>⚡ Recommendation:</strong>
                                        <p>Change your password immediately for affected accounts. Enable two-factor authentication.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Tips Section */}
            <div className="tips-section">
                <div className="section-header">
                    <h2>💡 Security Tips for You</h2>
                    <p>{deviceInfo ? 'Personalized recommendations based on your scan' : 'General best practices for digital privacy'}</p>
                </div>
                <div className="tips-grid">
                    {tips.map((tip) => (
                        <div className="paper-wrapper" key={tip.number}>
                            <span className="paper-badge">{tip.number}</span>
                            <Paper className='papers' title={tip.title} text={tip.text} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Scan;