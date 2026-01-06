/**
 * API Service for whoMi Backend
 * Safe, production-ready fetch layer
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Global safe fetch helper
 * - Always reads text first
 * - Never crashes on empty / HTML responses
 * - Throws clear errors
 */
async function safeFetch(url, options = {}) {
    const response = await fetch(url, options);

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || `Request failed (${response.status})`);
    }

    if (!text) {
        throw new Error("Empty response from server");
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON returned by server");
    }
}

/**
 * ===============================
 * Device Fingerprint Scan
 * ===============================
 */
export async function deviceScan(advancedData = {}) {
    return safeFetch(`${API_BASE_URL}/api/device-scan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(advancedData)
    });
}

/**
 * ===============================
 * Create Email / Username Scan
 * ===============================
 */
export async function startScan(type, value) {
    return safeFetch(`${API_BASE_URL}/api/scan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ type, value })
    });
}

/**
 * ===============================
 * Fetch Scan Report
 * ===============================
 */
export async function getReport(scanId) {
    return safeFetch(`${API_BASE_URL}/api/report/${scanId}`, {
        method: "GET"
    });
}

/**
 * ===============================
 * Breach Check
 * ===============================
 */
export async function checkBreach(email) {
    return safeFetch(`${API_BASE_URL}/api/breach-check`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });
}

/**
 * ===============================
 * AI Profile Prediction
 * ===============================
 */
export async function predictProfile(text) {
    return safeFetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
}
