export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>

        <p>
          Career Mode Universe collects basic account and subscription data
          required to operate the platform.
        </p>

        <p>
          We use trusted third-party providers including Stripe for payments
          and Supabase for authentication and database services.
        </p>

        <p>
          We do not sell personal data to third parties.
        </p>

        <p>
          By using the platform, you agree to the collection and processing
          of data necessary for the service to function.
        </p>
      </div>
    </main>
  );
}