import { getStore } from '@netlify/blobs';

export default async (request) => {
  try {
    const { userId, dataType, data } = await request.json();
    
    if (!userId || !dataType) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Simple store initialization - Netlify handles the rest
    const store = getStore('mounjaro-data');
    const key = `${userId}-${dataType}`;
    
    await store.set(key, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));

    return Response.json({ 
      success: true,
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Save error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
};

export const config = {
  path: "/api/save-data"
};