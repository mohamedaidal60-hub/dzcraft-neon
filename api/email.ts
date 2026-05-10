import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'DZCRAFTDESIGN <contact@dzcd.fr>'; 

export const emailService = {
  /**
   * Confirmation de commande
   */
  async sendOrderConfirmation(to: string, orderData: any) {
    try {
      const { name, orderId, total, items } = orderData;
      
      const itemsHtml = items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; color: #111;">${item.name}</div>
            <div style="font-size: 12px; color: #666;">${item.size || ''} ${item.color || ''} x${item.quantity}</div>
          </td>
          <td style="padding: 12px 0; text-align: right; color: #111;">${item.price.toFixed(2)} €</td>
        </tr>
      `).join('');

      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #065f46; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Merci pour votre commande !</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 20px 20px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">Votre commande <strong>#${orderId}</strong> a bien été enregistrée. Nous préparons vos créations avec le plus grand soin.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Détails de la commande</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 20px 0 0; font-weight: 700; font-size: 18px;">Total</td>
                  <td style="padding: 20px 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #065f46;">${total.toFixed(2)} €</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fdf2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 30px;">
              <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">
                Action requise : Paiement
              </p>
              <p style="margin: 5px 0 0; font-size: 13px; color: #b91c1c;">
                Votre commande sera expédiée dès réception de votre paiement par Virement ou Paypal (instructions envoyées via WhatsApp).
              </p>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 40px;">
              Une question ? Répondez simplement à cet email ou contactez-nous sur WhatsApp au +33 7 67 09 91 15.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} DZCRAFTDESIGN - L'identité algérienne moderne en Europe.
          </div>
        </div>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `Confirmation de commande #${orderId} - DZCRAFTDESIGN`,
        html: html,
      });

      return { success: true };
    } catch (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
  },

  /**
   * Email de Bienvenue
   */
  async sendWelcomeEmail(to: string, name: string) {
    try {
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #065f46; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Bienvenue chez DZCRAFTDESIGN</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 20px 20px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">C'est un plaisir de vous compter parmi nos membres. DZCRAFTDESIGN célèbre l'héritage algérien à travers des créations uniques et modernes.</p>
            
            <p style="font-size: 16px; line-height: 1.6;">Vous pouvez désormais suivre vos commandes, sauvegarder vos favoris et accéder à nos exclusivités.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://dz-farah-backup.vercel.app/" style="background-color: #065f46; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600;">Découvrir la collection</a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} DZCRAFTDESIGN - Fait avec passion.
          </div>
        </div>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `Bienvenue chez DZCRAFTDESIGN, ${name} !`,
        html: html,
      });

      return { success: true };
    } catch (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
  },

  /**
   * Mise à jour du Tracking
   */
  async sendTrackingEmail(to: string, trackingData: any) {
    try {
      const { name, orderId, trackingNumber, carrier } = trackingData;
      
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #065f46; padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Votre colis est en route !</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 20px 20px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonne nouvelle <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">Votre commande <strong>#${orderId}</strong> a été expédiée via ${carrier}.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-radius: 12px; text-align: center;">
              <div style="font-size: 14px; color: #065f46; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Numéro de suivi</div>
              <div style="font-size: 24px; font-weight: 700; color: #064e3b; letter-spacing: 2px;">${trackingNumber}</div>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Vous pouvez suivre l'acheminement de votre colis sur le site de ${carrier} d'ici quelques heures.
            </p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: `Votre commande #${orderId} a été expédiée !`,
        html: html,
      });

      return { success: true };
    } catch (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }
  }
};
