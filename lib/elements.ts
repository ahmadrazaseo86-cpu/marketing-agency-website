// Default page elements matching the marketing website
export const DEFAULT_PAGE_ELEMENTS: Record<string, any> = {
  home: {
    hero: {
      badge: 'Strategic Digital Growth Agency',
      title: 'Strategic Marketing That Drives Measurable Growth',
      subtitle:
        'We help businesses in Pakistan and beyond build strong brands, generate qualified leads and achieve sustainable growth through data-driven digital marketing.',
      ctaPrimaryText: 'Explore Our Services',
      ctaPrimaryLink: '/services',
      ctaSecondaryText: 'Contact Us Today',
      ctaSecondaryLink: '/contact',
      backgroundImage:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop',
    },
    intro: {
      heading: 'A Marketing Partner You Can Rely On',
      text: 'NexaRank was founded in Lahore, Pakistan with a clear mission: to provide businesses with honest, effective and results-driven marketing services. What began as a dedicated team has grown into a full-service digital agency serving clients across Pakistan, the Middle East and worldwide.',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
    },
    stats: [
      { id: '1', number: '8+', label: 'Years of Experience' },
      { id: '2', number: '200+', label: 'Projects Delivered' },
      { id: '3', number: '150+', label: 'Clients Served' },
      { id: '4', number: '94%', label: 'Client Retention Rate' },
    ],
    services: [
      {
        id: '1',
        title: 'Search Engine Optimization',
        description: 'Sustainable rankings that drive organic traffic and qualified customer leads.',
        icon: 'search',
        link: '/services',
      },
      {
        id: '2',
        title: 'Social Media Marketing',
        description: 'Brand building and engaging content across LinkedIn, Meta, and Instagram.',
        icon: 'share-2',
        link: '/services',
      },
      {
        id: '3',
        title: 'Paid Advertising (PPC)',
        description: 'High ROAS Google and Meta ad campaigns engineered for immediate conversions.',
        icon: 'dollar-sign',
        link: '/services',
      },
      {
        id: '4',
        title: 'Content Marketing',
        description: 'Compounding SEO articles, case studies, and lead magnets.',
        icon: 'edit-3',
        link: '/services',
      },
      {
        id: '5',
        title: 'Email Marketing',
        description: 'Automated conversion workflows and customer retention newsletters.',
        icon: 'mail',
        link: '/services',
      },
      {
        id: '6',
        title: 'Branding & Web Design',
        description: 'Modern, high-converting digital identity and performance websites.',
        icon: 'layout',
        link: '/services',
      },
    ],
    testimonials: [
      {
        id: '1',
        name: 'Asad Malik',
        role: 'Director, TechVision Solutions',
        quote:
          'NexaRank transformed our online presence. Their SEO work helped us rank on the first page for our key terms within four months.',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      {
        id: '2',
        name: 'Sara Ahmed',
        role: 'CEO, GreenLeaf Organics',
        quote:
          'Their paid advertising team delivered a consistent 5x return on our ad spend. Clear communication, transparency, and no surprises.',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
    ],
    contactInfo: {
      email: 'ahmadrazaseo86@gmail.com',
      phone: '+92 304 4599845',
      address: 'Lahore, Punjab, Pakistan',
      hours: 'Monday to Friday, 9:00 to 18:00',
    },
    ctaBand: {
      title: 'Ready to Scale Your Business?',
      text: 'Get in touch with our strategy team for a free marketing consultation and website audit.',
      buttonText: 'Request Free Consultation',
      buttonLink: '/contact',
    },
  },
  global: {
    siteName: 'NexaRank',
    tagline: 'Strategic Marketing That Drives Measurable Growth',
    logoText: 'NexaRank',
    footerCopyright: '© 2026 NexaRank Agency. All rights reserved.',
  },
};
