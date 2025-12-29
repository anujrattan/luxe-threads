import React from 'react';
import { Button } from '../components/ui';
import { SparklesIcon, TargetIcon, DropletIcon, HeartIcon } from '../components/icons';

export const AboutPage: React.FC = () => {

  const values = [
    {
      icon: <SparklesIcon className="w-8 h-8 text-brand-accent"/>,
      title: 'Unmatched Quality',
      description: 'From fabric selection to printing techniques, we are obsessed with quality. Every item is crafted to be a long-lasting favorite.'
    },
    {
      icon: <TargetIcon className="w-8 h-8 text-brand-accent"/>,
      title: 'Pixel-Perfect Design',
      description: 'We believe in the power of great design. Our products serve as the perfect canvas for creativity, ensuring every detail is crisp and clear.'
    },
    {
      icon: <DropletIcon className="w-8 h-8 text-brand-accent"/>,
      title: 'Sustainable Practices',
      description: 'We are committed to reducing our environmental footprint by using eco-friendly materials and on-demand production.'
    },
  ];

  return (
    <div className="animate-fadeIn pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554126807-6b10f600673a?q=80&w=1950&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-brand-bg/70"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-brand-primary text-center">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">About PODStore</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl font-sans text-brand-secondary">Crafting quality, one thread at a time. We're passionate about bringing your ideas to life on premium, comfortable apparel.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary">Our Mission</h2>
            <p className="mt-4 text-brand-secondary leading-relaxed">
              Our mission is to empower self-expression by providing an exceptional platform for custom-designed apparel. We bridge the gap between imagination and reality, offering high-quality, sustainable products that people love to wear and share. We're not just printing clothes; we're helping you tell your story.
            </p>
             <p className="mt-4 text-brand-secondary leading-relaxed">
              At PODStore, we handle the logistics, printing, and shipping, so you can focus on what you do best: creating.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              alt="Our Team"
              className="rounded-xl shadow-lg border border-white/10"
            />
          </div>
        </div>
      </section>

       {/* Values Section */}
      <section className="bg-brand-surface/50">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-center text-brand-primary">Our Core Values</h2>
            <p className="mt-2 text-center text-brand-secondary font-sans max-w-2xl mx-auto">The principles that guide every decision we make.</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {values.map(value => (
                <div key={value.title} className="flex flex-col items-center">
                    <div className="flex-shrink-0">{value.icon}</div>
                    <h3 className="mt-4 text-xl font-display font-semibold text-brand-primary">{value.title}</h3>
                    <p className="mt-2 text-brand-secondary">{value.description}</p>
                </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-brand-primary">Ready to Create?</h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-brand-secondary">Explore our collections or start designing your own masterpiece today.</p>
        <Button onClick={() => setPage({ name: 'categories' })} className="mt-8 px-8 py-3 text-lg">Shop Now</Button>
      </section>
    </div>
  );
};
