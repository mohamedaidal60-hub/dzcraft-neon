import Stripe from 'stripe';
import pkg from 'pg';
const { Client } = pkg;

// Initialize Stripe with the secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { items, email, orderId } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

  try {
    // Parse price safely
    const parsePrice = (p: any) => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return parseFloat(p.replace(',', '.')) || 0;
      return 0;
    };

    // Build Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: [item.size ? `Taille: ${item.size}` : '', item.color ? `Couleur: ${item.color}` : ''].filter(Boolean).join(' · ') || undefined,
        },
        unit_amount: Math.round(parsePrice(item.price) * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // Add shipping fee (4.99 EUR)
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Livraison Point Relais',
        },
        unit_amount: 499,
      },
      quantity: 1,
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://dz-farah-backup.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,
      success_url: `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: { order_id: orderId || '' },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message || 'Erreur interne' });
  }
}
