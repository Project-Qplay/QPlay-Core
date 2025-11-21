"""
Netlify Function - Main API handler for Quantum Quest
This serverless function handles all backend API routes
"""
import json
import os
import sys

# Add backend directory to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'backend'))
sys.path.insert(0, backend_path)

def handler(event, context):
    """
    Netlify Function handler
    Routes requests to appropriate backend endpoints
    """
    try:
        # Import Flask app from backend
        from backend_app import app, handle_request
        
        # Extract request information from Netlify event
        # Netlify passes the full path, we need to extract the part after the function name
        raw_path = event.get('path', '/')
        
        # Remove the function prefix if present (/.netlify/functions/api)
        if raw_path.startswith('/.netlify/functions/api'):
            path = raw_path.replace('/.netlify/functions/api', '')
            if not path:
                path = '/'
        else:
            path = raw_path
        
        method = event.get('httpMethod', 'GET')
        headers = event.get('headers', {})
        body = event.get('body', '')
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Call Flask app handler
        response = handle_request(path, method, headers, body, query_params)
        
        return response
        
    except ImportError as e:
        print(f"Import error in Netlify function: {str(e)}")
        print(f"Python path: {sys.path}")
        print(f"Backend path: {backend_path}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Import error: {str(e)}',
                'backend_path': backend_path
            })
        }
    except Exception as e:
        print(f"Error in Netlify function: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }

