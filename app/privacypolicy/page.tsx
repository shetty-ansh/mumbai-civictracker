export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to MumbaiTracker. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">2. Information We Collect</h2>
            <p>
              MumbaiTracker is primarily an informational platform. We do not require users to create an account to access our civic data. 
              If you interact with our WhatsApp bot, we temporarily collect your phone number and message contents strictly to provide the requested service (e.g., sending ward PDF reports).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">3. How We Use Information</h2>
            <p>
              Any information we collect is used solely to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and improve our services.</li>
              <li>Respond to your requests, comments, or questions.</li>
              <li>Send requested documents (like corporator report cards) via WhatsApp.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">4. Data Sharing and Security</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">5. Third-Party Services</h2>
            <p>
              We may use third-party services (such as Supabase for database hosting, Vercel for web hosting, and Meta/WhatsApp for messaging). These services have their own privacy policies regarding how they handle data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">6. Changes to this Policy</h2>
            <p>
              We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us via our developer links provided on the homepage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
