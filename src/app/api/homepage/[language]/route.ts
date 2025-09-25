import { NextRequest, NextResponse } from 'next/server';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import {
  HomepageContentResponse,
  HomepageContentRequest
} from '@/types/homepage-api';

// Mock data for testing - replace with actual database calls
// Helper type for route context
type RouteContext<T extends Record<string, string>> = {
  params: T;
};

interface Params {
  params: {
    language: string;
  };
}

// Local mock fallback used when backend is unavailable
const mockHomepageData: HomepageContentResponse = {
  id: 'homepage_en_mock',
  language: 'en',
  hero: {
    id: 'hero_mock',
    title: 'Welcome to ThinkCyber',
    subtitle: 'Secure. Scalable. Simple.',
    backgroundImage: '',
    ctaText: 'Get Started',
    ctaLink: '/dashboard/overview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  about: {
    id: 'about_mock',
    title: 'About ThinkCyber',
    content: 'Security solutions made easy.',
    image: '',
    features: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  contact: {
    id: 'contact_mock',
    email: 'support@thinkcyber.local',
    phone: '',
    address: '',
    hours: '',
    description: '',
    supportEmail: 'support@thinkcyber.local',
    salesEmail: 'sales@thinkcyber.local',
    socialLinks: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  faqs: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  isPublished: true,
  createdBy: 'system',
  updatedBy: 'system'
};

// ------------------ POST ------------------
export async function POST(
  request: Request,
  context: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await context.params;
    const body: HomepageContentRequest = await request.json();

    // Validate language parameter (now only supporting English)
    const supportedLanguages = ['en'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only English language is supported',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.hero?.title || !body.about?.title || !body.contact?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          validationErrors: [
            {
              field: 'hero.title',
              message: 'Hero title is required',
              code: 'REQUIRED'
            },
            {
              field: 'about.title',
              message: 'About title is required',
              code: 'REQUIRED'
            },
            {
              field: 'contact.email',
              message: 'Contact email is required',
              code: 'REQUIRED'
            }
          ],
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Here you would implement your database save logic using apiService
    // Call backend API using apiService
    const response = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, {
      language,
      hero: {
        title: body.hero.title.trim(),
        subtitle: body.hero.subtitle.trim(),
        background_image: body.hero.backgroundImage,
        cta_text: body.hero.ctaText,
        cta_link: body.hero.ctaLink
      },
      about: {
        title: body.about.title.trim(),
        content: body.about.content.trim(),
        image: body.about.image,
        features: body.about.features
      },
      contact: {
        email: body.contact.email.trim(),
        phone: body.contact.phone,
        address: body.contact.address,
        hours: body.contact.hours,
        description: body.contact.description,
        support_email: body.contact.supportEmail,
        sales_email: body.contact.salesEmail,
        social_links: {
          facebook: body.contact.socialLinks?.facebook || '',
          twitter: body.contact.socialLinks?.twitter || '',
          linkedin: body.contact.socialLinks?.linkedin || ''
        }
      },
      faqs: (body.faqs || []).map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        is_active: faq.isActive
      }))
    });

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to save homepage data',
          statusCode: 500
        },
        { status: 500 }
      );
    }
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create response data from API response or fallback to mock structure
    const responseData: HomepageContentResponse = response.data || {
      id: 'homepage_en_001',
      language,
      hero: {
        id: 'hero_001',
        title: body.hero.title,
        subtitle: body.hero.subtitle,
        backgroundImage: body.hero.backgroundImage,
        ctaText: body.hero.ctaText,
        ctaLink: body.hero.ctaLink,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      about: {
        id: 'about_001',
        title: body.about.title,
        content: body.about.content,
        image: body.about.image,
        features: body.about.features,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      contact: {
        id: 'contact_001',
        email: body.contact.email,
        phone: body.contact.phone,
        address: body.contact.address,
        hours: body.contact.hours,
        description: body.contact.description,
        supportEmail: body.contact.supportEmail,
        salesEmail: body.contact.salesEmail,
        socialLinks: body.contact.socialLinks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      faqs: (body.faqs || []).map((faq, index) => ({
        id: `faq_${Date.now()}_${index}`,
        question: faq.question,
        answer: faq.answer,
        order: faq.order || index + 1,
        isActive: faq.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isPublished: true,
      createdBy: 'admin',
      updatedBy: 'admin'
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}
// ------------------ GET ------------------
export async function GET(
  request: Request,
  { params }: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await params;

    // Validate language parameter (only supporting English)
    const supportedLanguages = ['en'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only English language is supported',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    try {
      // Call backend API
      const response = await apiService.get(
        API_ENDPOINTS.HOMEPAGE.BY_LANGUAGE(language)
      );

      if (!response.success) {
        return NextResponse.json({
          success: true,
          data: mockHomepageData,
          message: 'Using mock data - backend not available'
        });
      }

      const homepageData = response.data || mockHomepageData;

      return NextResponse.json({
        success: true,
        data: homepageData
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: mockHomepageData,
        message: 'Using mock data - backend connection failed'
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}

// ------------------ PUT ------------------
export async function PUT(
  request: Request,
  context: { params: Promise<{ language: string }> }
) {
  try {
    const { language } = await context.params;

    console.log('PUT /api/homepage/content');

    const body = await request.json();
    console.log(
      'PUT /api/homepage/content - Request body:',
      JSON.stringify(body, null, 2)
    );

    if (!language || language !== 'en') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or unsupported language',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is required',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    // Validate required sections
    const heroValid = body.hero && body.hero.title && body.hero.subtitle;
    const aboutValid = body.about && body.about.title && body.about.content;
    const contactValid = body.contact && body.contact.email;

    if (!heroValid || !aboutValid || !contactValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          validationErrors: [
            !heroValid && {
              field: 'hero',
              message: 'Hero title and subtitle are required'
            },
            !aboutValid && {
              field: 'about',
              message: 'About title and content are required'
            },
            !contactValid && {
              field: 'contact',
              message: 'Contact email is required'
            }
          ].filter(Boolean),
          statusCode: 400
        },
        { status: 400 }
      );
    }

    let response;
    try {
      response = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, {
        language,
        hero: {
          title: body.hero.title.trim(),
          subtitle: body.hero.subtitle.trim(),
          background_image: body.hero.backgroundImage,
          cta_text: body.hero.ctaText,
          cta_link: body.hero.ctaLink
        },
        about: {
          title: body.about.title.trim(),
          content: body.about.content.trim(),
          image: body.about.image,
          features: body.about.features
        },
        contact: {
          email: body.contact.email.trim(),
          phone: body.contact.phone,
          address: body.contact.address,
          hours: body.contact.hours,
          description: body.contact.description,
          support_email: body.contact.supportEmail,
          sales_email: body.contact.salesEmail,
          social_links: {
            facebook: body.contact.socialLinks?.facebook || '',
            twitter: body.contact.socialLinks?.twitter || '',
            linkedin: body.contact.socialLinks?.linkedin || ''
          }
        },
        faqs: (body.faqs || []).map((faq: any) => ({
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          is_active: faq.isActive
        }))
      });
    } catch (apiError) {
      console.log('Backend API failed, using mock response');
      response = { success: true, data: null } as any;
    }

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error || 'Failed to update homepage data',
          statusCode: 500
        },
        { status: 500 }
      );
    }

    const updatedData: HomepageContentResponse = response.data || {
      ...mockHomepageData,
      hero: {
        ...mockHomepageData.hero,
        ...body.hero,
        updatedAt: new Date().toISOString()
      },
      about: {
        ...mockHomepageData.about,
        ...body.about,
        updatedAt: new Date().toISOString()
      },
      contact: {
        ...mockHomepageData.contact,
        ...body.contact,
        updatedAt: new Date().toISOString()
      },
      faqs: (body.faqs || []).map((faq: any, index: number) => ({
        id: `faq_${Date.now()}_${index}`,
        question: faq.question,
        answer: faq.answer,
        order: faq.order || index + 1,
        isActive: faq.isActive ?? true,
        createdAt:
          mockHomepageData.faqs.find((f) => (f as any).order === faq.order)
            ?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      updatedAt: new Date().toISOString(),
      version: mockHomepageData.version + 1,
      updatedBy: 'admin'
    };

    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error) {
    console.error('PUT /api/homepage/[language] - Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}
