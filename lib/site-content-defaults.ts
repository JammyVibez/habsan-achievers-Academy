import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';

export type HeroSlide = { title: string; subtitle: string; image: string };

export type CoreValueItem = { title: string; description: string };

export type PublicSiteContent = {
  [SITE_CONTENT_KEYS.hero]: { slides: HeroSlide[] };
  [SITE_CONTENT_KEYS.principal]: {
    image: string;
    heading: string;
    paragraphs: string[];
    signatureName: string;
    signatureTitle: string;
  };
  [SITE_CONTENT_KEYS.about]: {
    title: string;
    content: string;
    mission: string;
    vision: string;
  };
  [SITE_CONTENT_KEYS.contact]: {
    address: string;
    phone: string;
    email: string;
    office_hours: string;
  };
  [SITE_CONTENT_KEYS.coreValues]: {
    sectionTitle: string;
    items: CoreValueItem[];
  };
};

export function getDefaultPublicSiteContent(): PublicSiteContent {
  return {
    [SITE_CONTENT_KEYS.hero]: {
      slides: [
        {
          title: 'Welcome to HABSAN ACHIEVERS ACADEMY',
          subtitle: 'Nurturing Excellence, Building Future Leaders',
          image: '/nigerian-school-children-learning-happily.jpg',
        },
        {
          title: 'Quality Education for All',
          subtitle: 'From Pre-Nursery to Secondary School',
          image: '/modern-classroom-with-diverse-students.jpg',
        },
        {
          title: 'Join Our Community',
          subtitle: 'Admissions Now Open for 2024/2025 Session',
          image: '/happy-school-children-in-blue-uniform.jpg',
        },
      ],
    },
    [SITE_CONTENT_KEYS.principal]: {
      image: '/professional-nigerian-school-principal-in-office.jpg',
      heading: 'Message from the Principal',
      paragraphs: [
        'Welcome to HABSAN ACHIEVERS ACADEMY, where we are committed to providing quality education that nurtures the whole child. Our dedicated staff and modern facilities create an environment where students can thrive academically, socially, and morally.',
        'We believe that every child has unique potential, and our mission is to help them discover and develop their talents. Through our comprehensive curriculum and character development programs, we prepare students not just for examinations, but for life.',
        'I invite you to join our community of learners and experience the HABSAN difference.',
      ],
      signatureName: 'Dr. Ibrahim Hassan',
      signatureTitle: 'Principal, HABSAN ACHIEVERS ACADEMY',
    },
    [SITE_CONTENT_KEYS.about]: {
      title: 'About HABSAN ACHIEVERS ACADEMY',
      content:
        'HABSAN ACHIEVERS ACADEMY (H.A.A) is a leading educational institution committed to academic excellence and character development. We offer comprehensive education from Pre-Nursery through Secondary School (SS3), following the Nigerian curriculum with modern teaching methodologies.',
      mission:
        'To provide quality education that develops the intellectual, physical, social, and moral capacities of our students.',
      vision:
        'To be the leading educational institution in Nigeria, producing well-rounded individuals who contribute positively to society.',
    },
    [SITE_CONTENT_KEYS.contact]: {
      address: 'Plot 123, Education Avenue, Abuja, Nigeria',
      phone: '+234-XXX-XXX-XXXX',
      email: 'info@habsan.edu.ng',
      office_hours: 'Monday - Friday: 8:00 AM - 4:00 PM',
    },
    [SITE_CONTENT_KEYS.coreValues]: {
      sectionTitle: 'Our Core Values',
      items: [
        { title: 'Excellence', description: 'We strive for the highest standards in all we do' },
        { title: 'Integrity', description: 'We uphold honesty and strong moral principles' },
        { title: 'Innovation', description: 'We embrace modern teaching methods and technology' },
        { title: 'Respect', description: 'We value diversity and treat everyone with dignity' },
      ],
    },
  };
}
