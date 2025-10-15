import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code de suivi requis' },
        { status: 400 }
      );
    }

    // Fetch from Amana API
    const timestamp = new Date().getTime();
    const url = `https://bam-tracking.barid.ma/Tracking/Search?trackingCode=${code}&_=${timestamp}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check if operation was successful
    if (!data.OperationSuccess || !data.Html) {
      return NextResponse.json({
        success: false,
        trackingCode: code,
        message: 'Aucune information trouvée pour ce code',
        data: null
      });
    }

    // Use regex to parse HTML instead of cheerio
    const html = data.Html;

    // Helper function to extract text between HTML tags
    const extractText = (html, className) => {
      const regex = new RegExp(`class="${className}"[^>]*>([^<]*)<`, 'i');
      const match = html.match(regex);
      return match ? match[1].trim() : null;
    };

    // Extract package information
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

    // Extract origin
    const originMatch = html.match(/class="tooltip_depart"[^>]*>([^<]*)</i);
    if (originMatch) {
      packageInfo.origin = originMatch[1].trim();
    }

    // Extract timeline events
    const timelineRegex = /<li>[\s\S]*?class="bullet">(\d+)<[\s\S]*?class="container_date">([^<]*)<[\s\S]*?class="container_time">([^<]*)<[\s\S]*?<div[^>]*>([^<]*(?:CENTRE|centre|agence)[^<]*)</gi;
    let match;
    while ((match = timelineRegex.exec(html)) !== null) {
      packageInfo.timeline.push({
        number: match[1].trim(),
        date: match[2].trim(),
        time: match[3].trim(),
        description: match[4].trim()
      });
    }

    // Determine status
    let status = 'pending';
    if (packageInfo.deliveryDate) {
      status = 'delivered';
    } else if (packageInfo.timeline.length > 0) {
      status = 'in-transit';
    }

    return NextResponse.json({
      success: true,
      trackingCode: code,
      status,
      data: packageInfo,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';