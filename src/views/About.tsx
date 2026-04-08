import { motion } from 'motion/react';

export function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-foreground text-background p-8 rounded-3xl shadow-pop"
    >
      <h1 className="text-4xl font-heading font-extrabold mb-6 text-accent">About Lumiere</h1>
      
      <div className="space-y-6 text-background/90 leading-relaxed">
        <p className="text-lg">Lumiere is a cinematic discovery platform built for movie lovers.</p>
        
        <section>
          <h2 className="text-2xl font-heading font-bold mb-3 text-secondary">Our goal is simple:</h2>
          <p>Help you never miss iconic title card moments in movies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Users can:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Explore movie title cards</li>
            <li>Share cinematic moments</li>
            <li>Rate and comment on films</li>
            <li>Connect with other cinephiles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Technology</h2>
          <p>Lumiere is built using modern technologies like React and Firebase to provide a fast and seamless experience.</p>
        </section>

        <section>
          <p>This project was created with a passion for cinema and storytelling.</p>
          <p className="font-bold text-accent mt-4">Stay cinematic 🎬</p>
        </section>
      </div>
    </motion.div>
  );
}
