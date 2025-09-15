// Mock services data for development/testing
export const mockServices = [
  // Manicure
  {
    id: 1,
    name: 'Classic Manicure',
    description: 'Nail shaping, cuticle care, and polish application.',
    category: 'Manicure',
    duration_minutes: 45,
    price: 80.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish with nail shaping and cuticle care.',
    category: 'Manicure',
    duration_minutes: 60,
    price: 120.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'French Manicure',
    description: 'Classic French tips with nail shaping and cuticle care.',
    category: 'Manicure',
    duration_minutes: 60,
    price: 110.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Spa Manicure',
    description: 'Manicure with exfoliation, mask, and hand massage.',
    category: 'Manicure',
    duration_minutes: 75,
    price: 150.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Pedicure
  {
    id: 5,
    name: 'Classic Pedicure',
    description: 'Foot soak, nail shaping, cuticle care, and polish.',
    category: 'Pedicure',
    duration_minutes: 60,
    price: 120.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Gel Pedicure',
    description: 'Long-lasting gel polish pedicure with full foot care.',
    category: 'Pedicure',
    duration_minutes: 75,
    price: 160.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Spa Pedicure',
    description: 'Pedicure with exfoliation, mask, callus smoothing, and massage.',
    category: 'Pedicure',
    duration_minutes: 90,
    price: 190.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Podology
  {
    id: 8,
    name: 'Medical Pedicure (Podology)',
    description: 'Specialized foot care for calluses, corns, and nail concerns.',
    category: 'Podology',
    duration_minutes: 60,
    price: 200.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    name: 'Ingrown Toenail Treatment',
    description: 'Relief and corrective care for ingrown toenails.',
    category: 'Podology',
    duration_minutes: 45,
    price: 180.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    name: 'Callus and Corn Removal',
    description: 'Professional removal and smoothing of calluses and corns.',
    category: 'Podology',
    duration_minutes: 45,
    price: 160.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Facial treatments
  {
    id: 11,
    name: 'Classic Facial',
    description: 'Deep cleanse, exfoliation, mask, and hydration.',
    category: 'Facial',
    duration_minutes: 60,
    price: 220.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 12,
    name: 'Microdermabrasion Facial',
    description: 'Exfoliating treatment to improve texture and radiance.',
    category: 'Facial',
    duration_minutes: 60,
    price: 280.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 13,
    name: 'Hydrating Facial',
    description: 'Intense hydration for dry and sensitive skin.',
    category: 'Facial',
    duration_minutes: 60,
    price: 240.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 14,
    name: 'Anti-Aging Facial',
    description: 'Targeted treatment to reduce fine lines and improve firmness.',
    category: 'Facial',
    duration_minutes: 75,
    price: 320.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Eyebrows
  {
    id: 15,
    name: 'Eyebrow Shaping',
    description: 'Brow mapping and shaping with waxing or threading.',
    category: 'Eyebrows',
    duration_minutes: 20,
    price: 60.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 16,
    name: 'Eyebrow Tint',
    description: 'Semi-permanent tint to define and enhance brows.',
    category: 'Eyebrows',
    duration_minutes: 20,
    price: 55.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 17,
    name: 'Eyebrow Lamination',
    description: 'Brow lift for fuller, defined shape and hold.',
    category: 'Eyebrows',
    duration_minutes: 45,
    price: 160.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Permanent makeup
  {
    id: 18,
    name: 'Permanent Makeup - Powder Brows',
    description: 'Soft powder effect for naturally filled-in brows.',
    category: 'Permanent Makeup',
    duration_minutes: 150,
    price: 900.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 19,
    name: 'Permanent Makeup - Microblading',
    description: 'Hair-stroke technique to create natural-looking brows.',
    category: 'Permanent Makeup',
    duration_minutes: 150,
    price: 950.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 20,
    name: 'Permanent Makeup - Brow Touch-up',
    description: 'Maintenance and refresh for permanent brow treatments.',
    category: 'Permanent Makeup',
    duration_minutes: 90,
    price: 450.0,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Other beauty services
  {
    id: 21,
    name: 'Makeup Application',
    description: 'Day or evening makeup tailored to your occasion.',
    category: 'Other',
    duration_minutes: 60,
    price: 220.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 22,
    name: 'Lash Lift & Tint',
    description: 'Curl and tint for lifted, natural-looking lashes.',
    category: 'Other',
    duration_minutes: 60,
    price: 190.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 23,
    name: 'Waxing - Full Leg',
    description: 'Full leg wax for smooth, hair-free skin.',
    category: 'Other',
    duration_minutes: 45,
    price: 160.0,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 24,
    name: 'Waxing - Underarm',
    description: 'Quick and effective underarm hair removal.',
    category: 'Other',
    duration_minutes: 15,
    price: 60.0,
    is_active: true,
    created_at: new Date().toISOString()
  }
];
