import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Fetching from Amana...`);
      
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
      });
      
      console.log(`[Attempt ${attempt}] Response status: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`[Attempt ${attempt}] Error:`, error.code || error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`[Attempt ${attempt}] Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
    }
  }
}

export async function GET(request, { params }) {
  try {
    const { code } = await params;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code de suivi requis' },
        { status: 400 }
      );
    }

    console.log(`\n=== Tracking Request for: ${code} ===`);
    
    const timestamp = new Date().getTime();
    const url = `https://bam-tracking.barid.ma/Tracking/Search?trackingCode=${code}&_=${timestamp}`;

    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://bam-tracking.barid.ma/',
        'Origin': 'https://bam-tracking.barid.ma',
        'Connection': 'keep-alive',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    }, 3);

    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`);
      return NextResponse.json(
        { error: 'API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Operation Success: ${data.OperationSuccess}`);

    if (!data.OperationSuccess || !data.Html) {
      return NextResponse.json({
        success: false,
        trackingCode: code,
        message: 'Aucune information trouvée',
        data: null
      });
    }

    const html = data.Html;
    console.log(`HTML received, length: ${html.length}`);

    const extractText = (html, className) => {
      const patterns = [
        new RegExp(`class="${className}"[^>]*>\\s*([^<]+)`, 'i'),
        new RegExp(`class=['"]${className}['"][^>]*>\\s*([^<]+)`, 'i'),
        new RegExp(`${className}['"\\s][^>]*>\\s*([^<]+)`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1] && match[1].trim() !== '...') {
          return match[1].trim();
        }
      }
      return null;
    };

    const packageInfo = {
      trackingCode: code,
      product: extractText(html, 'lblProductName'),
      weight: extractText(html, 'lblWeight'),
      amount: extractText(html, 'lblMttCrbt'),
      currentPosition: extractText(html, 'lblCurrentPosition'),
      depositDate: extractText(html, 'lblDepositDate'),
      destination: extractText(html, 'lblRecipient'),
      origin: null,
      deliveryDate: null,
      timeline: []
    };

    console.log('Extracted basic info:', {
      product: packageInfo.product,
      weight: packageInfo.weight,
      amount: packageInfo.amount,
      position: packageInfo.currentPosition,
    });

    const originPatterns = [
      /class="tooltip_depart"[^>]*>([^<]+)/i,
      /tooltip_depart[^>]*>([^<]+)/i,
    ];
    
    for (const pattern of originPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        packageInfo.origin = match[1].trim();
        break;
      }
    }

    const timelinePatterns = [
      /<li>[\s\S]*?class="bullet">(\d+)<\/div>[\s\S]*?class="container_date">([^<]+)<\/div>[\s\S]*?class="container_time">([^<]+)<\/div>[\s\S]*?<div[^>]*class="mt-3[^>]*>([^<]+(?:<b>[^<]*<\/b>)?[^<]*)<\/div>/gi,
      /<li>[\s\S]*?bullet">(\d+)<[\s\S]*?container_date">([^<]+)<[\s\S]*?container_time">([^<]+)<[\s\S]*?mt-3[^>]*>([\s\S]*?)<\/div>/gi,
    ];

    let foundTimeline = false;
    for (const pattern of timelinePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let description = match[4].trim();
        const time = match[3].trim();
        
        description = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        description = description
          .replace(/&#xE9;/g, 'é')
          .replace(/&#xE0;/g, 'à')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        if (description.startsWith(time)) {
          description = description.substring(time.length).trim();
        }
        
        if (description) {
          packageInfo.timeline.push({
            number: match[1].trim(),
            date: match[2].trim(),
            time: time,
            description: description
          });
          foundTimeline = true;
        }
      }
      
      if (foundTimeline) break;
    }

    console.log(`Found ${packageInfo.timeline.length} timeline events`);

    let status = 'pending';
    if (packageInfo.deliveryDate) {
      status = 'delivered';
    } else if (packageInfo.timeline.length > 0) {
      status = 'in-transit';
    }

    console.log(`✓ Successfully parsed package data`);
    console.log(`=== End Request ===\n`);

    const jsonResponse = NextResponse.json({
      success: true,
      trackingCode: code,
      status,
      data: packageInfo,
      fetchedAt: new Date().toISOString()
    });

    // Add cache control headers
    jsonResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    jsonResponse.headers.set('Pragma', 'no-cache');
    jsonResponse.headers.set('Expires', '0');

    return jsonResponse;

  } catch (error) {
    console.error('\n❌ API Error:', error);
    console.error('Error code:', error.code);
    console.error('Error cause:', error.cause);
    console.log(`=== End Request (Error) ===\n`);
    
    let userMessage = 'Le service Amana est temporairement indisponible.';
    
    if (error.code === 'ECONNRESET') {
      userMessage = 'La connexion avec Amana a été interrompue. Veuillez réessayer.';
    } else if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      userMessage = 'Le service Amana met trop de temps à répondre. Veuillez réessayer.';
    } else if (error.code === 'ENOTFOUND') {
      userMessage = 'Impossible de joindre le service Amana. Vérifiez votre connexion internet.';
    }
    
    return NextResponse.json(
      { 
        error: 'Connection failed',
        message: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code,
        retry: true
      },
      { status: 503 }
    );
  }
}