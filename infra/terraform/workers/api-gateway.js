// API Gateway Worker for WeMaster
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Backend API URL (from environment or Fly.io)
    const backendUrl = env.BACKEND_URL || 'https://api.wemaster.dev';
    
    try {
      // Proxy requests to backend
      const backendRequest = new Request(`${backendUrl}${path}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });

      // Add rate limiting headers
      backendRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));
      backendRequest.headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP'));
      
      const response = await fetch(backendRequest);
      
      // Copy response and add CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
      });

      return newResponse;
    } catch (error) {
      console.error('API Gateway Error:', error);
      return new Response(JSON.stringify({ error: 'Service Unavailable' }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};