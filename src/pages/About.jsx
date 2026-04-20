import React from 'react';

export default function About() {
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Our Story</h1>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '2rem' }}>
        FeedHope was born out of a simple, yet powerful idea: no food should go to waste while there are people going hungry. We noticed that every day, significant amounts of perfectly good food are thrown away by restaurants, events, and households, simply because there wasn't an efficient way to redistribute it.
      </p>
      <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        Our mission is to bridge the gap between food surplus and food scarcity. By connecting donors directly with trusted partner NGOs locally, we ensure that excess meals are rescued and delivered to those who need them most. Built to nourish and designed to sustain, FeedHope is empowering communities to fight against food waste and hunger, one meal at a time.
      </p>
    </div>
  );
}
