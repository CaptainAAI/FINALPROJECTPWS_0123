import React, { useState } from 'react';
import '../styles/ApiDocumentation.css';

function ApiDocumentation({ apiBaseUrl }) {
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const workflowSteps = [
    {
      step: 1,
      name: 'User Registration',
      method: 'POST',
      path: '/auth/register',
      description: 'Create a new user account',
      body: { username: 'testuser', email: 'test@example.com', password: 'password123', fullName: 'Test User' },
      example: `curl -X POST ${apiBaseUrl}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123", "fullName": "Test User"}'`
    },
    {
      step: 2,
      name: 'User Login',
      method: 'POST',
      path: '/auth/login',
      description: 'Login to get JWT token',
      body: { email: 'test@example.com', password: 'password123' },
      example: `curl -X POST ${apiBaseUrl}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "password123"}'`
    },
    {
      step: 3,
      name: 'Verify Profile Access',
      method: 'GET',
      path: '/auth/profile',
      description: 'Get user profile data',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X GET ${apiBaseUrl}/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 4,
      name: 'Generate API Key',
      method: 'POST',
      path: '/apikeys/generate',
      description: 'Generate a new API key',
      headers: 'Authorization: Bearer {{jwtToken}}',
      body: { name: 'Test Device' },
      example: `curl -X POST ${apiBaseUrl}/apikeys/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"name": "Test Device"}'`
    },
    {
      step: 5,
      name: 'List API Keys',
      method: 'GET',
      path: '/apikeys',
      description: 'Get all API keys for the authenticated user',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X GET ${apiBaseUrl}/apikeys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 6,
      name: 'Register First Face',
      method: 'POST',
      path: '/recognition/register',
      description: 'Register a new face with a name (Training Image)',
      headers: 'x-api-key: {{apiKey}}',
      body: 'image: [photo1.jpg], name: John Doe',
      example: `curl -X POST ${apiBaseUrl}/recognition/register \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/photo.jpg" \\
  -F "name=John Doe"`
    },
    {
      step: 7,
      name: 'List Registered Faces',
      method: 'GET',
      path: '/recognition/registered',
      description: 'Get all registered faces',
      headers: 'x-api-key: {{apiKey}}',
      example: `curl -X GET ${apiBaseUrl}/recognition/registered \\
  -H "x-api-key: YOUR_API_KEY"`
    },
    {
      step: 8,
      name: 'Detect & Identify Face',
      method: 'POST',
      path: '/recognition/detect',
      description: 'Detect and identify faces in an image (Same Person)',
      headers: 'x-api-key: {{apiKey}}',
      body: 'image: [photo2.jpg], threshold: 0.6',
      example: `curl -X POST ${apiBaseUrl}/recognition/detect \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/photo2.jpg" \\
  -F "threshold=0.6"`
    },
    {
      step: 9,
      name: 'Test with Unknown Face',
      method: 'POST',
      path: '/recognition/detect',
      description: 'Negative test - face should not be matched',
      headers: 'x-api-key: {{apiKey}}',
      body: 'image: [different person], threshold: 0.6',
      example: `curl -X POST ${apiBaseUrl}/recognition/detect \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/unknown.jpg" \\
  -F "threshold=0.6"`
    },
    {
      step: 10,
      name: 'Check Recognition Logs',
      method: 'GET',
      path: '/recognition/logs',
      description: 'Get face recognition logs',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X GET ${apiBaseUrl}/recognition/logs?limit=10&skip=0 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 11,
      name: 'Check API Key Usage',
      method: 'GET',
      path: '/apikeys',
      description: 'Verify API key usage count and last used timestamp',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X GET ${apiBaseUrl}/apikeys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 12,
      name: 'Revoke API Key',
      method: 'PATCH',
      path: '/apikeys/1/revoke',
      description: 'Revoke (deactivate) a specific API key',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X PATCH ${apiBaseUrl}/apikeys/1/revoke \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 13,
      name: 'Test with Revoked Key',
      method: 'POST',
      path: '/recognition/detect',
      description: 'Negative test - should fail with 401 "API key is inactive"',
      headers: 'x-api-key: {{apiKey}}',
      body: 'image: [any photo]',
      example: `curl -X POST ${apiBaseUrl}/recognition/detect \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/photo.jpg"`
    },
    {
      step: 14,
      name: 'Reactivate API Key',
      method: 'PATCH',
      path: '/apikeys/1/activate',
      description: 'Activate a previously revoked API key',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X PATCH ${apiBaseUrl}/apikeys/1/activate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 15,
      name: 'Test Reactivated Key',
      method: 'POST',
      path: '/recognition/detect',
      description: 'Detection should work again - verify matched: true',
      headers: 'x-api-key: {{apiKey}}',
      body: 'image: [John Doe photo], threshold: 0.6',
      example: `curl -X POST ${apiBaseUrl}/recognition/detect \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/johndoe.jpg" \\
  -F "threshold=0.6"`
    },
    {
      step: 16,
      name: 'Admin Access Test',
      method: 'GET',
      path: '/admin/users',
      description: 'Get all users (Admin only - returns 200 if admin, 403 if regular user)',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X GET ${apiBaseUrl}/admin/users \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    },
    {
      step: 17,
      name: 'Delete API Key',
      method: 'DELETE',
      path: '/apikeys/1',
      description: 'Delete a specific API key (Cleanup)',
      headers: 'Authorization: Bearer {{jwtToken}}',
      example: `curl -X DELETE ${apiBaseUrl}/apikeys/1 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
    }
  ];

  return (
    <div className="api-documentation">
      <div className="doc-header">
        <h2>API Documentation</h2>
        <p className="doc-subtitle">Complete guide to using the Face Recognition API</p>
      </div>

      <div className="doc-intro">
        <h3>Getting Started</h3>
        <div className="intro-section">
          <h4>Base URL</h4>
          <div className="code-block">
            <code>{apiBaseUrl}</code>
            <button 
              className="copy-btn"
              onClick={() => copyToClipboard(apiBaseUrl, 'baseUrl')}
            >
              {copiedEndpoint === 'baseUrl' ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="intro-section">
          <h4>Authentication Methods</h4>
          <ul>
            <li><strong>JWT Token:</strong> Obtain by logging in via <code>/api/auth/login</code> (Step 2)</li>
            <li><strong>API Key:</strong> Generate via <code>/api/apikeys/generate</code> (Step 4)</li>
          </ul>
        </div>
      </div>

      <div className="workflow-container">
        <h3 className="workflow-title">Complete 17-Step Testing Workflow</h3>
        {workflowSteps.map((step) => (
          <div key={step.step} className="endpoint-card">
            <div className="endpoint-header">
              <span className="step-badge">Step {step.step}</span>
              <span className={`method-badge method-${step.method.toLowerCase()}`}>
                {step.method}
              </span>
              <span className="endpoint-path">{step.path}</span>
            </div>
            
            <h4 className="endpoint-name">{step.name}</h4>
            <p className="endpoint-description">{step.description}</p>

            {step.headers && (
              <div className="endpoint-section">
                <h5>Headers</h5>
                <div className="code-block">
                  <pre>{step.headers}</pre>
                </div>
              </div>
            )}

            {step.body && (
              <div className="endpoint-section">
                <h5>Request Body</h5>
                <div className="code-block">
                  <pre>{typeof step.body === 'object' ? JSON.stringify(step.body, null, 2) : step.body}</pre>
                </div>
              </div>
            )}

            <div className="endpoint-section">
              <h5>Example cURL Request</h5>
              <div className="code-block">
                <pre>{step.example}</pre>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(step.example, `step-${step.step}`)}
                >
                  {copiedEndpoint === `step-${step.step}` ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="doc-footer">
        <h3>Error Handling</h3>
        <p>The API uses standard HTTP status codes:</p>
        <ul>
          <li><strong>200:</strong> Success</li>
          <li><strong>201:</strong> Resource created</li>
          <li><strong>400:</strong> Bad request (invalid parameters)</li>
          <li><strong>401:</strong> Unauthorized (invalid or missing authentication)</li>
          <li><strong>403:</strong> Forbidden (insufficient permissions)</li>
          <li><strong>404:</strong> Resource not found</li>
          <li><strong>500:</strong> Internal server error</li>
        </ul>
      </div>
    </div>
  );
}

export default ApiDocumentation;
