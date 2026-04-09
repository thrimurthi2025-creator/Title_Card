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
        <p className="text-lg">Lumiere is a cinematic discovery platform built for movie lovers, by movie lovers. We believe that cinema is not just about the plot or the acting, but about the artistry in every single frame.</p>
        
        <section>
          <h2 className="text-2xl font-heading font-bold mb-3 text-secondary">Our Vision</h2>
          <p>Our goal is simple: Help you never miss iconic title card moments in movies. We noticed that while many platforms focus on reviews or ratings, very few celebrate the visual storytelling found in title cards—the very first impression a film makes on its audience.</p>
          <p>Lumiere aims to be the definitive archive for these cinematic moments. Whether it's the bold typography of a 70s thriller or the minimalist elegance of a modern indie film, we want to capture and catalog them all.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">What You Can Do</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Explore:</strong> Browse our extensive library of movie title cards from various genres and eras.</li>
            <li><strong>Share:</strong> Capture and share your favorite cinematic moments with our community.</li>
            <li><strong>Engage:</strong> Rate and comment on films to discuss the visual style and impact of their title sequences.</li>
            <li><strong>Connect:</strong> Join a community of cinephiles who appreciate the finer details of filmmaking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Our Technology</h2>
          <p>Lumiere is built using modern technologies like React and Firebase to provide a fast, seamless, and secure experience. We are committed to performance and accessibility, ensuring that movie lovers everywhere can enjoy our platform on any device.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Our Commitment</h2>
          <p>This project was created with a passion for cinema and storytelling. We are constantly working to improve the platform, add new features, and expand our archive of title cards. We value your feedback and encourage you to reach out to us with suggestions or just to share your love for cinema.</p>
          <p className="font-bold text-accent mt-4">Stay cinematic 🎬</p>
        </section>
      </div>
    </motion.div>
  );
}
