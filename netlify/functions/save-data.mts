import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (request: Request, context: Context) => {
  try {
    const { userId, dataType, data } = await request.json();
    
    if (!userId || !dataType) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use context.site.id for proper store initialization
    const store = getStore({
      name: 'mounjaro-data',
      siteID: context.site.id,
      token: context.auth.token
    });
    
    const key = `${userId}-${dataType}`;
    
    await store.set(key, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};