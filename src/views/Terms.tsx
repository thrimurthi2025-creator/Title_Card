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
        <p>Welcome to Lumiere. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
        
        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">1. User Responsibilities</h2>
          <p>You agree to use Lumiere only for lawful purposes and in accordance with these terms. You are prohibited from:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Using the platform for any illegal activities.</li>
            <li>Posting spam, unsolicited promotional content, or malicious software.</li>
            <li>Harassing, threatening, or abusing other users.</li>
            <li>Posting content that is abusive, defamatory, obscene, or otherwise offensive.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">2. Account Usage</h2>
          <p>To access certain features of Lumiere, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">3. Content Ownership and Responsibility</h2>
          <p>You retain ownership of the content you post on Lumiere. By posting content, you grant us a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute your content on our platform. You are solely responsible for the content you post and represent that you have all necessary rights to do so.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">4. Limitation of Liability</h2>
          <p>Lumiere is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the operation of our platform or the accuracy of the content. In no event shall Lumiere be liable for any damages arising out of your use of our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">5. Account Suspension and Termination</h2>
          <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for any violation of these terms or for any other reason we deem appropriate.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">6. Changes to Terms</h2>
          <p>We may update these terms from time to time. We will notify you of any changes by posting the updated terms on this page. Your continued use of Lumiere after such changes constitutes your acceptance of the new terms.</p>
        </section>

        <div className="pt-6 border-t border-background/20">
          <h3 className="font-bold">Contact:</h3>
          <p className="text-accent">thrimurthi2025@gmail.com</p>
        </div>
      </div>
    </motion.div>
  );
}
