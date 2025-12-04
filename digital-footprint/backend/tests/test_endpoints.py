"""
Unit tests for whoMi backend API endpoints
Run with: pytest tests/ -v
"""
import pytest
import json
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_scan_with_email(client):
    """Test POST /api/scan with valid email"""
    response = client.post('/api/scan',
                          data=json.dumps({'type': 'email', 'value': 'test@example.com'}),
                          content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'scan_id' in data
    assert data['status'] in ['done', 'running']

def test_scan_with_username(client):
    """Test POST /api/scan with valid username"""
    response = client.post('/api/scan',
                          data=json.dumps({'type': 'username', 'value': 'johndoe'}),
                          content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'scan_id' in data
    assert data['status'] in ['done', 'running']

def test_scan_invalid_type(client):
    """Test POST /api/scan with invalid type"""
    response = client.post('/api/scan',
                          data=json.dumps({'type': 'invalid', 'value': 'test'}),
                          content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_scan_missing_value(client):
    """Test POST /api/scan with missing value"""
    response = client.post('/api/scan',
                          data=json.dumps({'type': 'email'}),
                          content_type='application/json')
    assert response.status_code == 400

def test_get_report_success(client):
    """Test GET /api/report/<scan_id> with valid scan"""
    # First create a scan
    response = client.post('/api/scan',
                          data=json.dumps({'type': 'email', 'value': 'test@example.com'}),
                          content_type='application/json')
    scan_id = json.loads(response.data)['scan_id']
    
    # Now get the report
    response = client.get(f'/api/report/{scan_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['scan_id'] == scan_id
    assert 'results' in data
    assert 'created_at' in data

def test_get_report_not_found(client):
    """Test GET /api/report/<scan_id> with non-existent scan"""
    response = client.get('/api/report/nonexistent-id')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data

def test_breach_check_success(client):
    """Test POST /api/breach-check with valid email"""
    response = client.post('/api/breach-check',
                          data=json.dumps({'email': 'test@example.com'}),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'email' in data
    assert 'breaches' in data
    assert isinstance(data['breaches'], list)

def test_breach_check_missing_email(client):
    """Test POST /api/breach-check without email"""
    response = client.post('/api/breach-check',
                          data=json.dumps({}),
                          content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_predict_success(client):
    """Test POST /api/predict with valid text"""
    response = client.post('/api/predict',
                          data=json.dumps({'text': 'I love football and coding'}),
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'age_range' in data
    assert 'interests' in data
    assert 'risk_score' in data
    assert isinstance(data['interests'], list)

def test_predict_missing_text(client):
    """Test POST /api/predict without text"""
    response = client.post('/api/predict',
                          data=json.dumps({}),
                          content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_predict_empty_text(client):
    """Test POST /api/predict with empty text"""
    response = client.post('/api/predict',
                          data=json.dumps({'text': '   '}),
                          content_type='application/json')
    assert response.status_code == 400
