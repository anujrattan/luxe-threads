import React, { useState } from 'react';
import { HelpCircleIcon, ChevronDownIcon } from '../components/icons';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all items. Items must be unworn, unwashed, and in original packaging with tags attached. Returns are free for orders over $50.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. International shipping times vary by location.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see estimated shipping costs at checkout.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this to track your package on our website or the carrier\'s website.'
    },
    {
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we\'ll do our best to accommodate your request.'
    },
    {
      question: 'What sizes do you offer?',
      answer: 'We offer sizes S, M, L, XL for most apparel items. Some items may have different sizing - check the product page for specific size charts.'
    },
    {
      question: 'Are your products ethically made?',
      answer: 'Yes! We\'re committed to ethical manufacturing practices. All our products are made in facilities that meet strict labor and environmental standards.'
    }
  ];

  return (
    <div className="animate-fadeIn pb-16">
      {/* Hero Section */}
      <section className="relative bg-brand-surface/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <HelpCircleIcon className="w-12 h-12 text-brand-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-primary">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-brand-secondary">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-brand-surface rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-brand-primary pr-4">{faq.question}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-brand-secondary flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-brand-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-brand-surface/50 rounded-xl p-8 border border-white/10">
            <h3 className="text-xl font-display font-semibold text-brand-primary mb-2">
              Still have questions?
            </h3>
            <p className="text-brand-secondary mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <button
              onClick={() => setPage({ name: 'contact' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

