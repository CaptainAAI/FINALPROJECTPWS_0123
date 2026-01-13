import React, { useState } from 'react';
import '../styles/ApiDocumentation.css';

function ApiDocumentation({ apiBaseUrl }) {
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const apiEndpoints = [
    {
      category: 'Authentication',
      endpoints: [
        {
          name: 'Register User',
          method: 'POST',
          path: '/api/auth/register',
          description: 'Create a new user account',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            username: 'string (required)',
            email: 'string (required)',
            password: 'string (required)',
            fullName: 'string (optional)'
          },
          example: `curl -X POST ${apiBaseUrl}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "fullName": "John Doe"
  }'`
        },
        {
          name: 'Login',
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login to get JWT token',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          example: `curl -X POST ${apiBaseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'`
        }
      ]
    },
    {
      category: 'API Key Management',
      endpoints: [
        {
          name: 'Generate API Key',
          method: 'POST',
          path: '/api/apikeys/generate',
          description: 'Generate a new API key for face recognition',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          body: {
            name: 'string (required) - Name for the API key'
          },
          example: `curl -X POST ${apiBaseUrl}/api/apikeys/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "name": "My App API Key"
  }'`
        },
        {
          name: 'Get All API Keys',
          method: 'GET',
          path: '/api/apikeys',
          description: 'Get all API keys for the authenticated user',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/apikeys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Delete API Key',
          method: 'DELETE',
          path: '/api/apikeys/:keyId',
          description: 'Delete a specific API key',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X DELETE ${apiBaseUrl}/api/apikeys/1 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Revoke API Key',
          method: 'PATCH',
          path: '/api/apikeys/:keyId/revoke',
          description: 'Revoke (deactivate) a specific API key',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X PATCH ${apiBaseUrl}/api/apikeys/1/revoke \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Activate API Key',
          method: 'PATCH',
          path: '/api/apikeys/:keyId/activate',
          description: 'Activate a previously revoked API key',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X PATCH ${apiBaseUrl}/api/apikeys/1/activate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        }
      ]
    },
    {
      category: 'Face Recognition',
      endpoints: [
        {
          name: 'Detect & Identify Faces',
          method: 'POST',
          path: '/api/recognition/detect',
          description: 'Detect and identify faces in an image (Public endpoint - use API Key)',
          headers: {
            'x-api-key': '<YOUR_API_KEY>'
          },
          body: {
            image: 'file (required) - Image file to process',
            threshold: 'number (optional, default: 0.6) - Minimum similarity threshold'
          },
          example: `curl -X POST ${apiBaseUrl}/api/recognition/detect \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg" \\
  -F "threshold=0.6"`
        },
        {
          name: 'Verify Specific Face',
          method: 'POST',
          path: '/api/recognition/verify',
          description: 'Verify if an image matches a specific registered face',
          headers: {
            'x-api-key': '<YOUR_API_KEY>'
          },
          body: {
            image: 'file (required) - Image to verify',
            faceId: 'number (required) - ID of the registered face to verify against',
            threshold: 'number (optional, default: 0.6) - Minimum similarity threshold'
          },
          example: `curl -X POST ${apiBaseUrl}/api/recognition/verify \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg" \\
  -F "faceId=1" \\
  -F "threshold=0.6"`
        },
        {
          name: 'Register Face',
          method: 'POST',
          path: '/api/recognition/register',
          description: 'Register a new face with a name (Requires API Key or JWT)',
          headers: {
            'x-api-key': '<YOUR_API_KEY>',
            'OR Authorization': 'Bearer <JWT_TOKEN>'
          },
          body: {
            image: 'file (required) - Image containing the face',
            name: 'string (required) - Name of the person'
          },
          example: `curl -X POST ${apiBaseUrl}/api/recognition/register \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "image=@/path/to/face.jpg" \\
  -F "name=John Doe"`
        },
        {
          name: 'Get Registered Faces',
          method: 'GET',
          path: '/api/recognition/registered',
          description: 'Get all registered faces (Requires API Key or JWT)',
          headers: {
            'x-api-key': '<YOUR_API_KEY>',
            'OR Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/recognition/registered \\
  -H "x-api-key: YOUR_API_KEY"`
        },
        {
          name: 'Delete Registered Face',
          method: 'DELETE',
          path: '/api/recognition/registered/:faceId',
          description: 'Delete a registered face',
          headers: {
            'x-api-key': '<YOUR_API_KEY>',
            'OR Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X DELETE ${apiBaseUrl}/api/recognition/registered/1 \\
  -H "x-api-key: YOUR_API_KEY"`
        },
        {
          name: 'Get Recognition Logs',
          method: 'GET',
          path: '/api/recognition/logs',
          description: 'Get face recognition logs (Requires JWT)',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/recognition/logs \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        }
      ]
    },
    {
      category: 'Face Management',
      endpoints: [
        {
          name: 'Get All Faces',
          method: 'GET',
          path: '/api/faces',
          description: 'Get all registered faces (Requires JWT)',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/faces \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Update Face Name',
          method: 'PATCH',
          path: '/api/faces/:faceId',
          description: 'Update the name of a registered face',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          body: {
            name: 'string (required) - New name for the face'
          },
          example: `curl -X PATCH ${apiBaseUrl}/api/faces/1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "name": "Jane Doe"
  }'`
        },
        {
          name: 'Deactivate Face',
          method: 'PATCH',
          path: '/api/faces/:faceId/deactivate',
          description: 'Deactivate a registered face (won\'t be matched in recognition)',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X PATCH ${apiBaseUrl}/api/faces/1/deactivate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Reactivate Face',
          method: 'PATCH',
          path: '/api/faces/:faceId/reactivate',
          description: 'Reactivate a deactivated face',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X PATCH ${apiBaseUrl}/api/faces/1/reactivate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        }
      ]
    },
    {
      category: 'Admin (Requires Admin Role)',
      endpoints: [
        {
          name: 'Get All Users',
          method: 'GET',
          path: '/api/admin/users',
          description: 'Get list of all users (Admin only)',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/admin/users \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        },
        {
          name: 'Get Admin Logs',
          method: 'GET',
          path: '/api/admin/logs',
          description: 'Get all recognition logs from all users (Admin only)',
          headers: {
            'Authorization': 'Bearer <JWT_TOKEN>'
          },
          example: `curl -X GET ${apiBaseUrl}/api/admin/logs?limit=10&skip=0 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
        }
      ]
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
            <li><strong>JWT Token:</strong> Used for user-specific operations. Obtain by logging in via <code>/api/auth/login</code></li>
            <li><strong>API Key:</strong> Used for public face recognition operations. Generate via <code>/api/apikeys/generate</code></li>
          </ul>
        </div>

        <div className="intro-section">
          <h4>Complete 17-Step Testing Workflow</h4>
          <ol>
            <li><strong>User Registration:</strong> POST <code>/api/auth/register</code></li>
            <li><strong>User Login:</strong> POST <code>/api/auth/login</code> → Get JWT token</li>
            <li><strong>Verify Profile Access:</strong> GET <code>/api/auth/profile</code> with JWT</li>
            <li><strong>Generate API Key:</strong> POST <code>/api/apikeys/generate</code> with JWT</li>
            <li><strong>List API Keys:</strong> GET <code>/api/apikeys</code> with JWT</li>
            <li><strong>Register First Face:</strong> POST <code>/api/recognition/register</code> with API key</li>
            <li><strong>List Registered Faces:</strong> GET <code>/api/recognition/registered</code> with API key</li>
            <li><strong>Detect & Identify Face:</strong> POST <code>/api/recognition/detect</code> with API key</li>
            <li><strong>Test Unknown Face:</strong> POST <code>/api/recognition/detect</code> (negative test)</li>
            <li><strong>Check Recognition Logs:</strong> GET <code>/api/recognition/logs</code> with JWT</li>
            <li><strong>Check API Key Usage:</strong> GET <code>/api/apikeys</code> with JWT</li>
            <li><strong>Revoke API Key:</strong> PATCH <code>/api/apikeys/:keyId/revoke</code> with JWT</li>
            <li><strong>Test Revoked Key:</strong> POST <code>/api/recognition/detect</code> (should fail)</li>
            <li><strong>Reactivate API Key:</strong> PATCH <code>/api/apikeys/:keyId/activate</code> with JWT</li>
            <li><strong>Test Reactivated Key:</strong> POST <code>/api/recognition/detect</code> (should work)</li>
            <li><strong>Admin Access Test:</strong> GET <code>/api/admin/users</code> with JWT (if admin)</li>
            <li><strong>Delete API Key:</strong> DELETE <code>/api/apikeys/:keyId</code> with JWT</li>
          </ol>
        </div>

        <div className="intro-section">
          <h4>Response Format</h4>
          <p>All endpoints return JSON responses with the following structure:</p>
          <div className="code-block">
            <pre>{`{
  "success": true,
  "data": { ... },
  "message": "Success message"
}`}</pre>
          </div>
        </div>
      </div>

      {apiEndpoints.map((category, catIndex) => (
        <div key={catIndex} className="api-category">
          <h3 className="category-title">{category.category}</h3>
          
          {category.endpoints.map((endpoint, endIndex) => (
            <div key={endIndex} className="endpoint-card">
              <div className="endpoint-header">
                <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                <span className="endpoint-path">{endpoint.path}</span>
              </div>
              
              <h4 className="endpoint-name">{endpoint.name}</h4>
              <p className="endpoint-description">{endpoint.description}</p>

              {endpoint.headers && (
                <div className="endpoint-section">
                  <h5>Headers</h5>
                  <div className="code-block">
                    <pre>{Object.entries(endpoint.headers).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join('\n')}</pre>
                  </div>
                </div>
              )}

              {endpoint.body && (
                <div className="endpoint-section">
                  <h5>Request Body</h5>
                  <div className="code-block">
                    <pre>{Object.entries(endpoint.body).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join('\n')}</pre>
                  </div>
                </div>
              )}

              <div className="endpoint-section">
                <h5>Example Request</h5>
                <div className="code-block">
                  <pre>{endpoint.example}</pre>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(endpoint.example, `${catIndex}-${endIndex}`)}
                  >
                    {copiedEndpoint === `${catIndex}-${endIndex}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

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
