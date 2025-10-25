import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto scroll-smooth bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto text-slate-700 dark:text-slate-300">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Privacy Policy for AI Mazda Mechanic</h1>
        <p className="mb-4"><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p className="mb-4">
          AI Mazda Mechanic ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Information We Collect</h2>
        <p className="mb-4">
          We may collect information about you in a variety of ways. The information we may collect via the Application includes:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Session Data:</strong> All diagnostic sessions, including text messages, uploaded images, and videos, are stored locally on your device's browser storage (localStorage). We do not have access to this data.</li>
          <li><strong>Voice Data:</strong> If you use the voice-to-text feature, your audio is processed by your browser's native Speech Recognition API. We do not store or transmit your voice data to our servers.</li>
          <li><strong>Anonymous Usage Data:</strong> We may collect anonymous data about your interaction with the application to improve our services. This data is not personally identifiable.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          The data you provide is used for the following purposes:
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>To provide the core functionality of the diagnostic assistant.</li>
          <li>To persist your diagnostic sessions for future reference on your device.</li>
          <li>To improve the application's performance and features based on anonymous usage patterns.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Data Storage and Security</h2>
        <p className="mb-4">
          Your session data is stored exclusively in your browser's localStorage. This means your data remains on your device and is not uploaded to any server. You have full control over this data and can clear it at any time by clearing your browser's cache or by deleting sessions within the application.
        </p>
        <p className="mb-4">
          We do not use cookies for tracking purposes.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Third-Party Services</h2>
        <p className="mb-4">
          The application uses the Google Gemini API to process your queries and generate diagnostic responses. When you send a message, the content of that message (including text and any attached media) is sent to Google for processing. We recommend reviewing Google's Privacy Policy to understand how they handle your data.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us. (Note: This is a demo application, no contact information is provided).
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
