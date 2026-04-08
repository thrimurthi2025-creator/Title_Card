import { motion } from 'motion/react';

export function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-foreground text-background p-8 rounded-3xl shadow-pop"
    >
      <h1 className="text-4xl font-heading font-extrabold mb-6 text-accent">Terms and Conditions</h1>
      
      <div className="space-y-6 text-background/90 leading-relaxed">
        <p>Last updated: 2026</p>
        
        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">User Responsibilities</h2>
          <p>You agree not to use Lumiere for any unlawful purpose, including spamming, harassment, or posting abusive or illegal content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Account Usage</h2>
          <p>You are responsible for maintaining the security of your account. You must not share your login credentials.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Content Ownership</h2>
          <p>You retain ownership of the content you post, but you grant Lumiere a license to display it. You are solely responsible for the content you post.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Limitation of Liability</h2>
          <p>Lumiere is provided "as is". We are not liable for any damages arising from your use of the app.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Account Suspension</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violations of these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">Changes to Terms</h2>
          <p>We may update these terms from time to time. Your continued use of the app constitutes acceptance of the new terms.</p>
        </section>

        <div className="pt-6 border-t border-background/20">
          <h3 className="font-bold">Contact:</h3>
          <p className="text-accent">thrimurthi2025@gmail.com</p>
        </div>
      </div>
    </motion.div>
  );
}
