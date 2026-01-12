
| `baseUrl` | `http://localhost:5000/api` | API base URL |
| `jwtToken` | `` | JWT token (auto-filled after login) |
| `apiKey` | `` | API key (auto-filled after generation) |
| `userId` | `` | User ID (auto-filled after login) |
| `faceId` | `` | Face ID (auto-filled after registration) |

---

## Complete End-to-End Test Workflow

This is the complete testing sequence from start to finish:

### Test Scenario: Full Face Recognition System Test

**Prerequisites:**
- Backend server running on `http://localhost:5000`
- MySQL database running and configured
- Python face service available
- Test face images prepared (minimum 2 images of the same person)

**Complete Test Flow:**

#### 1. User Registration & Authentication
```
POST {{baseUrl}}/auth/register
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
Expected: 201 - User created successfully
Store: userId from response
```

#### 2. User Login
```
POST {{baseUrl}}/auth/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
Expected: 200 - JWT token returned
Store: jwtToken and userId in environment
Auto-script in Tests tab:
  var jsonData = pm.response.json();
  pm.environment.set("jwtToken", jsonData.token);
  pm.environment.set("userId", jsonData.user.id);
```

#### 3. Verify Profile Access
```
GET {{baseUrl}}/auth/profile
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - User profile data returned
Verify: userId matches, role is "user"
```

#### 4. Generate API Key
```
POST {{baseUrl}}/apikeys/generate
Headers: Authorization: Bearer {{jwtToken}}
Body: {
     "name": "Test Device"
}
Expected: 201 - API key created
Store: apiKey in environment
Auto-script in Tests tab:
  var jsonData = pm.response.json();
  pm.environment.set("apiKey", jsonData.apiKey.key);
Verify: expiresAt is 30 days from now
```

#### 5. List API Keys
```
GET {{baseUrl}}/apikeys
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - Array of API keys
Verify: "Test Device" appears with isActive: true, usageCount: 0
```

#### 6. Register First Face (Training Image)
```
POST {{baseUrl}}/recognition/register
Headers: x-api-key: {{apiKey}}
Body (form-data):
  - image: [Select clear face photo - photo1.jpg]
  - name: John Doe
Expected: 201 - Face registered successfully
Store: faceId in environment
Auto-script in Tests tab:
  var jsonData = pm.response.json();
  pm.environment.set("faceId", jsonData.face.id);
Verify: confidence > 0.8
```

#### 7. List Registered Faces
```
GET {{baseUrl}}/recognition/registered
Headers: x-api-key: {{apiKey}}
Expected: 200 - Array with "John Doe" face
Verify: faceId matches stored value
```

#### 8. Detect & Identify Face (Same Person)
```
POST {{baseUrl}}/recognition/detect
Headers: x-api-key: {{apiKey}}
Body (form-data):
  - image: [Different photo of same person - photo2.jpg]
  - threshold: 0.6
Expected: 200 - Face detected and recognized
Verify:
  - matched: true
  - bestMatch.faceName: "John Doe"
  - bestMatch.similarity > 0.6
  - duration < 3000ms
```

#### 9. Test with Unknown Face (Negative Test)
```
POST {{baseUrl}}/recognition/detect
Headers: x-api-key: {{apiKey}}
Body (form-data):
  - image: [Photo of different person]
  - threshold: 0.6
Expected: 200 - No match found
Verify:
  - matched: false
  - similarity < 0.6 OR no bestMatch
```

#### 10. Check Recognition Logs
```
GET {{baseUrl}}/recognition/logs?limit=10&skip=0
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - Array of recognition attempts
Verify:
  - At least 3 logs (register, detect, verify)
  - Status: "success" for all
  - Matched logs have matchedFaceId and matchedFaceName
```

#### 11. Check API Key Usage
```
GET {{baseUrl}}/apikeys
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - API keys list
Verify:
  - "Test Device" now has usageCount > 0
  - lastUsed is recent timestamp
```

#### 12. Revoke API Key
```
PATCH {{baseUrl}}/apikeys/1/revoke
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - API key revoked successfully
```

#### 13. Test with Revoked Key (Negative Test)
```
POST {{baseUrl}}/recognition/detect
Headers: x-api-key: {{apiKey}}
Body (form-data):
  - image: [Any face photo]
Expected: 401 - "API key is inactive"
Verify: Request blocked by middleware
```

#### 14. Reactivate API Key
```
PATCH {{baseUrl}}/apikeys/1/activate
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - API key activated successfully
```

#### 15. Test Reactivated Key
```
POST {{baseUrl}}/recognition/detect
Headers: x-api-key: {{apiKey}}
Body (form-data):
  - image: [Photo of John Doe]
  - threshold: 0.6
Expected: 200 - Detection works again
Verify: matched: true with "John Doe"
```

#### 16. Admin Access Test (if admin role)
```
GET {{baseUrl}}/admin/users
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 if admin, 403 if regular user
```

#### 17. Delete API Key (Cleanup)
```
DELETE {{baseUrl}}/apikeys/1
Headers: Authorization: Bearer {{jwtToken}}
Expected: 200 - API key deleted successfully
```