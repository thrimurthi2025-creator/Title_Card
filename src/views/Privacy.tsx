import { motion } from 'motion/react';

export function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-foreground text-background p-8 rounded-3xl shadow-pop"
    >
      <h1 className="text-4xl font-heading font-extrabold mb-6 text-accent">Privacy Policy</h1>
      <p className="text-sm text-background/70 mb-4">Last updated: 2026</p>
      
      <div className="space-y-6 text-background/90 leading-relaxed">
        <p>Welcome to Lumiere. We respect your privacy and are committed to protecting your information.</p>
        
        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">1. Information We Collect</h2>
          <p>We may collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Basic user information (name, email) when you sign in using Google</li>
            <li>User-generated content (posts, comments)</li>
            <li>Usage data (how you interact with the app)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">2. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and improve the app experience</li>
            <li>Enable features like comments, ratings, and profiles</li>
            <li>Maintain security and prevent misuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">3. Firebase Services</h2>
          <p>We use Firebase services (Authentication, Firestore, Storage) to manage user data securely.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">4. Cookies and Ads</h2>
          <p>We may use third-party services like Google AdSense, which may use cookies to show relevant ads.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">5. Data Security</h2>
          <p>We take reasonable steps to protect your data, but no method is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">6. Your Rights</h2>
          <p>You can:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Edit your profile information</li>
            <li>Request deletion of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">7. Changes</h2>
          <p>We may update this policy from time to time.</p>
        </section>

        <div className="pt-6 border-t border-background/20">
          <h3 className="font-bold">Contact:</h3>
          <p className="text-accent">thrimurthi2025@gmail.com</p>
        </div>
      </div>
    </motion.div>
  );
}
