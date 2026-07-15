import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const path = slug.join('/');
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const contentType = request.headers.get('content-type') || '';
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    if (contentType.includes('application/json')) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (contentType.includes('multipart/form-data')) {
        options.body = await request.formData();
      } else {
        try {
          const bodyText = await request.text();
          if (bodyText) {
            options.body = bodyText;
          }
        } catch (_) {
          // No body or error reading body
        }
      }
    }

    const response = await fetch(backendUrl, options);
    
    // Check for 204 No Content
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const resContentType = response.headers.get('content-type') || '';
    if (resContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const rawText = await response.text();
      return new Response(rawText, { status: response.status, headers: { 'Content-Type': resContentType } });
    }
  } catch (error: any) {
    console.error('API Admin Proxy Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as PUT,
  handleRequest as DELETE,
};
