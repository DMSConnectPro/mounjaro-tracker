import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const dataType = url.searchParams.get('dataType');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing userId' 
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
    
    if (dataType) {
      // Get specific data type
      const key = `${userId}-${dataType}`;
      const data = await store.get(key);      
      if (!data) {
        return new Response(JSON.stringify({ 
          success: true,
          data: null,
          message: 'No data found'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const parsed = JSON.parse(data);
      return new Response(JSON.stringify({ 
        success: true,
        ...parsed
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      // Get all data for user
      const dataTypes = ['doses', 'weights', 'foods'];
      const allData = {};
      
      for (const type of dataTypes) {
        const key = `${userId}-${type}`;
        const data = await store.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          allData[type] = parsed.data;
        }
      }      
      return new Response(JSON.stringify({ 
        success: true,
        data: allData,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Load error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};