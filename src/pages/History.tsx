import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function History() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Expected array for history posts, got:', data);
          setPosts([]);
        }
      })
      .catch(err => {
        console.error('Error fetching history:', err);
        setPosts([]);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <div className="text-sm font-medium text-stone-500 uppercase tracking-widest mb-4">
          Le saviez-vous ?
        </div>
        <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
          Histoires & Traditions
        </h1>
        <p className="text-stone-500 text-lg md:text-xl font-light">
          Découvrez les éléments de l'histoire algérienne qui inspirent nos collections. 
          Chaque article raconte une histoire.
        </p>
      </motion.div>

      <div className="space-y-32">
        {posts.length > 0 ? posts.map((post: any, index: number) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`grid md:grid-cols-2 gap-16 items-center relative ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {post.bg_image_url && (
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none bg-center bg-no-repeat bg-contain z-0"
                style={{ backgroundImage: `url(${post.bg_image_url})` }}
              />
            )}
            <div className={`aspect-[4/3] bg-stone-100 rounded-3xl overflow-hidden shadow-2xl relative z-10 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
              <img 
                src={post.image_url || `https://picsum.photos/seed/dz_hist_${post.id}/800/600`} 
                alt={post.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`relative z-10 ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">{post.title}</h2>
              <div className="prose prose-stone text-stone-600 text-lg leading-relaxed">
                <p>{post.content}</p>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-24 text-stone-500">
            <p className="text-xl">Bientôt de nouvelles histoires à découvrir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
