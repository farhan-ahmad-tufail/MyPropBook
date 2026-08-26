import React from 'react';
import { Shield, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-[#2d5a47] hover:underline mb-6">
            ← Back to Home
          </Link>
          <div className="w-12 h-12 bg-[#edf5f1] rounded-2xl flex items-center justify-center text-[#2d5a47] mb-6">
            <Book size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 mt-2 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using MyPropBook ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. MyPropBook is a property management tool designed for landlords and property managers in India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>
              MyPropBook provides software tools to assist in managing properties, tracking tenants, recording rent payments, calculating utility bills, and generating receipts. The Service is provided "as is" and is intended to assist in administrative tasks, not as a replacement for professional legal, accounting, or tax advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. User Accounts & Security</h2>
            <p className="mb-2">
              To use the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information during registration.</li>
              <li>Maintain the security of your password and account.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Take full responsibility for all activities that occur under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Data Ownership & Privacy</h2>
            <p>
              You retain all rights to the data you input into MyPropBook (tenant details, property records, financial information). We do not sell your property or tenant data to third parties. For detailed information on how we handle your data, please refer to our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Fair Use & Limitations</h2>
            <p>
              You agree not to misuse the Service or help anyone else do so. This includes attempting to disrupt our systems, using the Service to store illegal or offensive material, or scraping/extracting data from the Service without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, price change, or suspension of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p>
              In no event shall MyPropBook be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
