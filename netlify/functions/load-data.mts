import { getStore } from '@netlify/blobs';

export default async (request) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const dataType = url.searchParams.get('dataType');
    
    if (!userId) {
      return Response.json({ 
        success: false, 
        error: 'Missing userId' 
      }, { status: 400 });
    }

    // Simple store initialization - Netlify handles the rest
    const store = getStore('mounjaro-data');
    
    if (dataType) {
      // Get specific data type
      const key = `${userId}-${dataType}`;
      const data = await store.get(key);
      
      if (!data) {
        return Response.json({ 
          success: true,
          data: null,
          message: 'No data found'
        });
      }
      
      const parsed = JSON.parse(data);
      return Response.json({ 
        success: true,
        ...parsed
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
      
      return Response.json({ 
        success: true,
        data: allData,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Load error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
};

export const config = {
  path: "/api/load-data"
};