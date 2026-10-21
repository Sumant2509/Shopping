import { Order } from './types';

interface ZohoTokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: ZohoTokenCache | null = null;

/**
 * Returns Zoho OAuth domain based on region
 */
function getZohoAuthDomain(): string {
  return process.env.ZOHO_REGION === 'com' ? 'https://accounts.zoho.com' : 'https://accounts.zoho.in';
}

/**
 * Returns Zoho Books API base URL
 */
function getZohoBooksApiUrl(): string {
  return process.env.ZOHO_REGION === 'com'
    ? 'https://www.zohoapis.com/books/v3'
    : 'https://www.zohoapis.in/books/v3';
}

/**
 * Obtains or refreshes Zoho OAuth 2.0 Access Token
 */
export async function getZohoAccessToken(): Promise<string | null> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  // Use cached token if valid (buffer of 60 seconds)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    });

    const res = await fetch(`${getZohoAuthDomain()}/oauth/v2/token?${params.toString()}`, {
      method: 'POST',
    });

    const data = await res.json();
    if (res.ok && data.access_token) {
      cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };
      return data.access_token;
    }

    console.warn('[Zoho OAuth Error]: Failed to refresh access token:', data);
    return null;
  } catch (err) {
    console.error('[Zoho OAuth Exception]:', err);
    return null;
  }
}

/**
 * Creates or synchronizes customer contact in Zoho Books
 */
export async function syncCustomerToZoho(order: Order, token: string): Promise<string | null> {
  const orgId = process.env.ZOHO_ORG_ID;
  if (!orgId) return null;

  const apiUrl = getZohoBooksApiUrl();
  const phone = order.customer.phone || '';
  const email = order.customer.email || '';

  try {
    // 1. Search for existing contact by email or phone
    const searchUrl = `${apiUrl}/contacts?organization_id=${orgId}&search_text=${encodeURIComponent(
      email || phone
    )}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

    const searchData = await searchRes.json();
    if (searchRes.ok && searchData.contacts && searchData.contacts.length > 0) {
      return searchData.contacts[0].contact_id;
    }

    // 2. Create new Contact if not found
    const createRes = await fetch(`${apiUrl}/contacts?organization_id=${orgId}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_name: order.customer.name || `Customer ${phone.slice(-4)}`,
        company_name: 'Individual Retail Customer',
        customer_name: order.customer.name,
        email: email,
        phone: phone,
        billing_address: {
          address: `${order.customer.address.houseNo}, ${order.customer.address.street}`,
          city: order.customer.address.city,
          state: order.customer.address.state,
          zip: order.customer.address.pincode,
          country: 'India',
        },
        shipping_address: {
          address: `${order.customer.address.houseNo}, ${order.customer.address.street}`,
          city: order.customer.address.city,
          state: order.customer.address.state,
          zip: order.customer.address.pincode,
          country: 'India',
        },
      }),
    });

    const createData = await createRes.json();
    if (createRes.ok && createData.contact) {
      console.log(`[Zoho Books] Created new contact ID: ${createData.contact.contact_id}`);
      return createData.contact.contact_id;
    }

    console.warn('[Zoho Books] Contact creation response:', createData);
    return null;
  } catch (err) {
    console.error('[Zoho Books Contact Sync Error]:', err);
    return null;
  }
}

/**
 * Creates an official GST Invoice / Sales Order in Zoho Books for an Order
 */
export async function syncOrderToZoho(order: Order): Promise<{
  synced: boolean;
  zohoInvoiceId?: string;
  zohoInvoiceNumber?: string;
  error?: string;
}> {
  const orgId = process.env.ZOHO_ORG_ID;
  if (!orgId) {
    return { synced: false, error: 'ZOHO_ORG_ID not set' };
  }

  const token = await getZohoAccessToken();
  if (!token) {
    return { synced: false, error: 'Failed to obtain Zoho access token' };
  }

  try {
    const contactId = await syncCustomerToZoho(order, token);
    const apiUrl = getZohoBooksApiUrl();

    // Line items for Zoho invoice
    const lineItems = order.items.map((item) => ({
      name: `${item.name} (${item.shape} - ${item.dimensions})`,
      rate: item.price,
      quantity: item.quantity,
      description: `Color: ${item.selectedColor || 'Standard'} • Handcrafted Textile Doormat`,
    }));

    // Add shipping charge as line item if applicable
    if (order.shippingFee > 0) {
      lineItems.push({
        name: 'Standard Doorstep Delivery & Handling',
        rate: order.shippingFee,
        quantity: 1,
        description: 'Pan-India Express Courier Shipping',
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Create Invoice in Zoho Books
    const invoicePayload = {
      customer_id: contactId || undefined,
      contact_name: order.customer.name,
      reference_number: order.orderNumber,
      date: today,
      due_date: today,
      line_items: lineItems,
      discount: order.discount > 0 ? order.discount : undefined,
      notes: `Order placed online via Home-Warrior Store. Payment: ${order.paymentMethod} (${order.paymentStatus}). Estimated Delivery: ${order.estimatedDeliveryDate}`,
      terms: 'Handcrafted items made by local artisans. 7-Day replacement guarantee.',
      is_inclusive_tax: true,
    };

    const res = await fetch(`${apiUrl}/invoices?organization_id=${orgId}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const data = await res.json();
    if (res.ok && data.invoice) {
      console.log(`[Zoho Books] Invoice created successfully! Invoice #: ${data.invoice.invoice_number}, ID: ${data.invoice.invoice_id}`);
      return {
        synced: true,
        zohoInvoiceId: data.invoice.invoice_id,
        zohoInvoiceNumber: data.invoice.invoice_number,
      };
    }

    console.warn('[Zoho Books Invoice Creation]:', data);
    return { synced: false, error: data.message || 'Invoice creation returned error' };
  } catch (err: any) {
    console.error('[Zoho Books Order Sync Error]:', err);
    return { synced: false, error: err.message };
  }
}
