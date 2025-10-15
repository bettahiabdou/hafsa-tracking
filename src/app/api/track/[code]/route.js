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

    // Dynamic import of cheerio for better compatibility
    const cheerio = await import('cheerio');
    const $ = cheerio.load;

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
        { error: 'Erreur lors de la récupération des données' },
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

    // Parse HTML with Cheerio
    const doc = $(data.Html);

    // Extract package information
    const packageInfo = {
      trackingCode: code,
      product: doc('.lblProductName').text().trim() || null,
      weight: doc('.lblWeight').text().trim() || null,
      amount: doc('.lblMttCrbt').text().trim() || null,
      currentPosition: doc('.lblCurrentPosition').text().trim() || null,
      depositDate: doc('.lblDepositDate').text().trim() || null,
      destination: doc('.lblRecipient').text().trim() || null,
      origin: doc('.tooltip_depart').first().text().trim() || null,
      deliveryDate: null,
      timeline: []
    };

    // Extract delivery date if exists
    const deliveryDateText = doc('.infotip_arrivee .b-subtitle').text().trim();
    if (deliveryDateText && !deliveryDateText.includes('..')) {
      packageInfo.deliveryDate = deliveryDateText;
    }

    // Extract timeline events
    doc('.timeline li').each((index, element) => {
      const date = doc(element).find('.container_date').text().trim();
      const time = doc(element).find('.container_time').text().trim();
      let description = doc(element).find('div:last-child').text().trim();
      const eventNumber = doc(element).find('.bullet').text().trim();

      // Clean description - remove duplicate time at beginning
      if (description.startsWith(time)) {
        description = description.substring(time.length).trim();
      }

      if (date && description) {
        packageInfo.timeline.push({
          number: eventNumber || (index + 1).toString(),
          date,
          time,
          description
        });
      }
    });

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
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';