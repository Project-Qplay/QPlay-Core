"""
Netlify Function - Main API handler for Quantum Quest
This serverless function handles all backend API routes
"""
import json
import os
import sys
import traceback

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
sys.path.insert(0, backend_path)

def handler(event, context):
    """
    Netlify Function handler
    Routes requests to appropriate backend endpoints
    """
    try:
        # Import Flask app from backend
        from backend_app import app, handle_request
        
        # Extract request information
        path = event.get('path', '/')
        method = event.get('httpMethod', 'GET')
        headers = event.get('headers', {})
        body = event.get('body', '')
        query_params = event.get('queryStringParameters', {})
        
        # Call Flask app handler
        response = handle_request(path, method, headers, body, query_params)
        
        return response
        
    except Exception as e:
        print(f"Error in Netlify function: {str(e)}")
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
