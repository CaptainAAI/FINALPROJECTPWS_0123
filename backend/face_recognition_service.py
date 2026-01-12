"""
Face Recognition Service using InsightFace
"""
import cv2
import numpy as np
from insightface.app import FaceAnalysis
import json
import sys

class FaceRecognitionService:
    def __init__(self):
        self.app = FaceAnalysis(name='buffalo_l')
        self.app.prepare(ctx_id=0, det_size=(640, 480))
        self.known_faces = {}
    
    def detect_faces(self, image_path):
        """Detect faces in an image"""
        img = cv2.imread(image_path)
        if img is None:
            return {'error': 'Could not read image'}
        
        faces = self.app.get(img)
        
        results = []
        for face in faces:
            embedding = face.embedding
            bbox = face.bbox
            
            results.append({
                'confidence': float(face.det_score),
                'bbox': {
                    'x1': float(bbox[0]),
                    'y1': float(bbox[1]),
                    'x2': float(bbox[2]),
                    'y2': float(bbox[3])
                },
                'embedding': embedding.tolist()
            })
        
        return {
            'detected_faces': len(faces),
            'faces': results
        }
    
    def compare_faces(self, image_path1, image_path2, threshold=0.6):
        """Compare two face images"""
        img1 = cv2.imread(image_path1)
        img2 = cv2.imread(image_path2)
        
        if img1 is None or img2 is None:
            return {'error': 'Could not read one or both images'}
        
        faces1 = self.app.get(img1)
        faces2 = self.app.get(img2)
        
        if len(faces1) == 0 or len(faces2) == 0:
            return {
                'match': False,
                'similarity': 0.0,
                'message': 'No faces detected in one or both images'
            }
        
        # Compare first face from each image
        embedding1 = faces1[0].embedding
        embedding2 = faces2[0].embedding
        
        # Calculate cosine similarity
        sim = np.dot(embedding1, embedding2) / (
            np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
        )
        
        return {
            'match': sim >= threshold,
            'similarity': float(sim),
            'threshold': threshold
        }
    
    def extract_embedding(self, image_path):
        """Extract face embedding from image"""
        img = cv2.imread(image_path)
        if img is None:
            return {'error': 'Could not read image'}
        
        faces = self.app.get(img)
        
        if len(faces) == 0:
            return {'error': 'No face detected'}
        
        return {
            'embedding': faces[0].embedding.tolist(),
            'confidence': float(faces[0].det_score)
        }

if __name__ == '__main__':
    service = FaceRecognitionService()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'detect' and len(sys.argv) > 2:
            result = service.detect_faces(sys.argv[2])
            print(json.dumps(result))
        
        elif command == 'compare' and len(sys.argv) > 3:
            result = service.compare_faces(sys.argv[2], sys.argv[3])
            print(json.dumps(result))
        
        elif command == 'extract' and len(sys.argv) > 2:
            result = service.extract_embedding(sys.argv[2])
            print(json.dumps(result))
        
        else:
            print(json.dumps({'error': 'Invalid command'}))
    else:
        print(json.dumps({'error': 'No command provided'}))
