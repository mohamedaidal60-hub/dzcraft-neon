import React from 'react';
import { motion } from 'motion/react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100"
      >
        <h1 className="text-4xl font-serif mb-8 text-stone-900 border-b border-stone-100 pb-4">Conditions Générales d’Utilisation (CGU)</h1>
        
        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">1. Objet</h2>
            <p>Les présentes Conditions Générales d’Utilisation ont pour objet de définir les modalités d’accès et d’utilisation du site édité par :</p>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-2">
              <p className="font-bold text-stone-900">DZCRAFTDESIGN</p>
              <p>SASU</p>
              <p>Siège social : 36 rue Scheffer, 75016 Paris</p>
              <p>RCS Paris : 103 161 014</p>
              <p>Email : contact@dzcraftdesign.com</p>
            </div>
            <p className="mt-4 italic">Toute navigation sur le site implique l’acceptation sans réserve des présentes CGU.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">2. Accès au site</h2>
            <p>Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet. Tous les frais liés à l’accès au site (matériel, connexion, etc.) sont à la charge de l’utilisateur.</p>
            <p>DZCRAFTDESIGN se réserve le droit de suspendre ou limiter l’accès au site à tout moment, sans préavis.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">3. Contenu du site</h2>
            <p>Les informations présentes sur le site sont fournies à titre indicatif. DZCRAFTDESIGN s’efforce d’assurer l’exactitude des informations, sans garantir leur exhaustivité ou leur mise à jour.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">4. Propriété intellectuelle</h2>
            <p>Tous les éléments du site (textes, images, logos, designs, produits) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, modification ou utilisation sans autorisation est interdite.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">5. Comportement de l’utilisateur</h2>
            <p>L’utilisateur s’engage à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ne pas utiliser le site à des fins frauduleuses</li>
              <li>ne pas porter atteinte au bon fonctionnement du site</li>
              <li>ne pas tenter d’accéder de manière non autorisée aux systèmes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">6. Données personnelles</h2>
            <p>Les données personnelles sont collectées et traitées conformément à la politique de confidentialité du site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">7. Responsabilité</h2>
            <p>DZCRAFTDESIGN ne pourra être tenu responsable :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>des interruptions ou dysfonctionnements du site</li>
              <li>des dommages liés à l’utilisation du site</li>
              <li>de l’utilisation frauduleuse des informations par des tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">8. Liens externes</h2>
            <p>Le site peut contenir des liens vers des sites externes. DZCRAFTDESIGN n’est pas responsable du contenu de ces sites.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">9. Modification des CGU</h2>
            <p>DZCRAFTDESIGN se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions s’appliquent dès leur mise en ligne.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">10. Droit applicable</h2>
            <p>Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de DZCRAFTDESIGN.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
