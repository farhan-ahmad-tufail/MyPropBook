import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-[#2d5a47] hover:underline mb-6">
            ← Back to Home
          </Link>
          <div className="w-12 h-12 bg-[#edf5f1] rounded-2xl flex items-center justify-center text-[#2d5a47] mb-6">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 mt-2 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information to provide better services to all our users. This includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> When you sign up, we collect your name, email address, and authentication credentials.</li>
              <li><strong>Property & Tenant Data:</strong> The core function of MyPropBook requires you to input property details, tenant names, contact info, and rental agreements.</li>
              <li><strong>Financial Data:</strong> Rent amounts, utility readings, payments, and receipt generation data entered into the system.</li>
              <li><strong>Usage Data:</strong> Basic analytics on how you interact with the software to help us improve the product experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">The data we collect is strictly used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve the MyPropBook service.</li>
              <li>Generate accurate rent calculations and digital receipts on your behalf.</li>
              <li>Send critical service notifications (e.g., password resets, system updates).</li>
              <li>Ensure the security and integrity of your property management data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Data Sharing & Third Parties</h2>
            <p>
              <strong>We do not sell your personal or tenant data.</strong> We only share information with trusted third-party service providers (such as cloud hosting or secure authentication providers like Google/Firebase) strictly for the purpose of operating the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your property and tenant data from unauthorized access, alteration, disclosure, or destruction. We utilize secure databases and encrypted communication protocols (HTTPS/SSL).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Your Data Rights</h2>
            <p>
              You have full ownership of the property data you input. You have the right to access, update, export, or delete your data at any time. If you wish to delete your account and all associated data, you may contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
