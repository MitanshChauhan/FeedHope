import React from 'react';

export default function Terms() {
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Terms of Service</h1>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '1rem' }}>
        Welcome to FeedHope. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
      </p>
      <h3 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--secondary-color)' }}>1. Acceptance of Terms</h3>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        By registering for and using FeedHope, you agree to follow our guidelines and comply with all applicable local laws and regulations regarding food safety and donations.
      </p>
      <h3 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--secondary-color)' }}>2. User Responsibilities</h3>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        Donors must ensure that the food listed is safe for consumption and accurately described. NGOs are responsible for the safe collection, handling, and distribution of the claimed food. FeedHope acts solely as a facilitator and is not liable for the quality or safety of the donated food.
      </p>
    </div>
  );
}
