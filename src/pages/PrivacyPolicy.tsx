import React from 'react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100"
      >
        <h1 className="text-4xl font-serif mb-8 text-stone-900 border-b border-stone-100 pb-4">Politique de confidentialité</h1>
        
        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">1. Introduction</h2>
            <p>La présente politique de confidentialité a pour objectif d’informer les utilisateurs du site sur la manière dont leurs données personnelles sont collectées, utilisées et protégées.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">2. Responsable du traitement</h2>
            <p>Le responsable du traitement est :</p>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-2">
              <p className="font-bold text-stone-900">DZCRAFTDESIGN</p>
              <p>Société par actions simplifiée (SASU)</p>
              <p>Siège social : 36 rue Scheffer, 75016 Paris</p>
              <p>RCS Paris : 103 161 014</p>
              <p>Email : contact@dzcraftdesign.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">3. Données collectées</h2>
            <p>Nous pouvons collecter les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse postale (en cas de commande)</li>
              <li>Données de navigation (adresse IP, cookies, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">4. Finalité de la collecte</h2>
            <p>Les données sont collectées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gérer les commandes et livraisons</li>
              <li>Répondre aux demandes via le formulaire de contact</li>
              <li>Assurer le service client</li>
              <li>Améliorer l’expérience utilisateur</li>
              <li>Réaliser des statistiques de fréquentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">5. Base légale</h2>
            <p>Le traitement des données repose sur :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L’exécution d’un contrat (commande)</li>
              <li>Le consentement de l’utilisateur</li>
              <li>L’intérêt légitime (amélioration du site, sécurité)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">6. Durée de conservation</h2>
            <p>Les données sont conservées pendant :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>3 ans après le dernier contact pour les prospects</li>
              <li>10 ans pour les données de facturation (obligation légale)</li>
              <li>13 mois pour les cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">7. Partage des données</h2>
            <p>Les données peuvent être partagées avec :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L’hébergeur du site</li>
              <li>Les prestataires de paiement</li>
              <li>Les services de livraison (Mondial Relay)</li>
              <li>Les outils d’analyse (ex : statistiques)</li>
            </ul>
            <p className="mt-4 font-medium text-emerald-600">Les données ne sont jamais vendues.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">8. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger les données personnelles contre toute perte, accès non autorisé ou divulgation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">9. Droits des utilisateurs</h2>
            <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d’accès, de rectification et de suppression</li>
              <li>Droit d’opposition et à la portabilité</li>
            </ul>
            <p className="mt-4">Vous pouvez exercer vos droits en contactant : <span className="font-medium">contact@dzcraftdesign.com</span></p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">10. Cookies</h2>
            <p>Le site utilise des cookies pour améliorer la navigation et mesurer l’audience. Un bandeau de consentement permet à l’utilisateur d’accepter ou refuser ces cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-4">11. Modification de la politique</h2>
            <p>Cette politique peut être mise à jour à tout moment.</p>
            <p className="mt-4 text-sm text-stone-500 italic">Dernière mise à jour : 28/04/2026</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
