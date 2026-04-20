import React from 'react';

export default function Privacy() {
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Privacy Policy</h1>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '1rem' }}>
        At FeedHope, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal data when you use our platform.
      </p>
      <h3 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--secondary-color)' }}>Information Collection</h3>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        We collect information that you provide directly to us, such as when you create an account, update your profile, list or claim a donation, or communicate with us. This may include your name, email address, phone number, and location details.
      </p>
      <h3 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--secondary-color)' }}>How We Use Your Information</h3>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        We use the information we collect to operate, maintain, and improve our services; communicate with you about your account and donations; and ensure the safety and security of our platform.
      </p>
    </div>
  );
}
