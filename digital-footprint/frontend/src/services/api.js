/**
 * API Service for whoMi Backend
 * Provides methods to interact with the Flask backend endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ;
/**
 * Auto-scan current device information
 * @param {Object} advancedData - Optional advanced fingerprint data (canvas, screen, etc.)
 * @returns {Promise<Object>} Device info including IP, browser, OS
 */
export async function deviceScan(advancedData = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/device-scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(advancedData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Device scan failed');
        }

        const data = await response.json();
        return data; // { scan_id, device_info }
    } catch (error) {
        console.error('Error scanning device:', error);
        throw error;
    }
}

/**
 * Start a new scan for email or username
 * @param {string} type - 'email' or 'username'
 * @param {string} value - The email or username to scan
 * @returns {Promise<{scan_id: string, status: string}>}
 */
export async function startScan(type, value) {
    try {
        const response = await fetch(`${API_BASE_URL}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, value }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Scan failed');
        }

        const data = await response.json();
        return data; // { scan_id, status }
    } catch (error) {
        console.error('Error starting scan:', error);
        throw error;
    }
}

/**
 * Get scan report by ID
 * @param {string} scanId - The scan ID
 * @returns {Promise<Object>} Scan report with results
 */
export async function getReport(scanId) {
    try {
        const response = await fetch(`${API_BASE_URL}/report/${scanId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get report');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting report:', error);
        throw error;
    }
}

/**
 * Check if email appears in known data breaches
 * @param {string} email - Email address to check
 * @returns {Promise<{email: string, breaches: Array}>}
 */
export async function checkBreach(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/breach-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Breach check failed');
        }

        const data = await response.json();
        return data; // { email, breaches: [...] }
    } catch (error) {
        console.error('Error checking breaches:', error);
        throw error;
    }
}

/**
 * Get AI-based profile prediction from text
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Prediction with name, age, interests, risk score
 */
export async function predictProfile(text) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Prediction failed');
        }

        const data = await response.json();
        return data; // { name_guess, age_range, interests, risk_score, explain }
    } catch (error) {
        console.error('Error predicting profile:', error);
        throw error;
    }
}
