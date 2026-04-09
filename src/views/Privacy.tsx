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
        <p>Welcome to Lumiere. We respect your privacy and are committed to protecting your information. This Privacy Policy explains how we collect, use, and disclose information about you when you use our website and services.</p>
        
        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">1. Information We Collect</h2>
          <p>We collect information to provide better services to all our users. The information we collect includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Information you provide:</strong> When you sign in using Google, we collect basic user information such as your name, email address, and profile picture. We also collect content you create, such as posts, comments, and ratings.</li>
            <li><strong>Usage data:</strong> We automatically collect information about how you interact with our app, including your IP address, browser type, device information, and pages you visit.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">2. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide, maintain, and improve our services.</li>
            <li>To enable features like comments, ratings, and user profiles.</li>
            <li>To communicate with you, including responding to your inquiries and sending updates.</li>
            <li>To maintain the security of our platform and prevent misuse or fraudulent activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">3. Firebase Services</h2>
          <p>We use Firebase services, including Firebase Authentication, Cloud Firestore, and Firebase Storage, to manage user data securely. Firebase processes data in accordance with Google's privacy policies. Please refer to Firebase's own documentation for more information on how they handle data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">4. Cookies and Ads</h2>
          <p>We may use third-party services like Google AdSense, which may use cookies to show relevant ads based on your visits to our site and other sites on the internet. You can opt out of personalized advertising by visiting Google's Ads Settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">5. Data Security</h2>
          <p>We take reasonable steps to protect your data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">6. Your Rights</h2>
          <p>You have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accessing and updating your profile information.</li>
            <li>Requesting the deletion of your personal data.</li>
            <li>Opting out of certain data collection practices.</li>
          </ul>
          <p>Please contact us if you wish to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2 text-secondary">7. Changes to this Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this policy periodically for any changes.</p>
        </section>

        <div className="pt-6 border-t border-background/20">
          <h3 className="font-bold">Contact:</h3>
          <p className="text-accent">thrimurthi2025@gmail.com</p>
        </div>
      </div>
    </motion.div>
  );
}
