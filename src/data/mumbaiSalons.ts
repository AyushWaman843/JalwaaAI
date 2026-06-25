import { Salon } from '../types';

export const MUMBAI_SALONS_SEED: Salon[] = [
  {
    id: "mumbai_bblunt_bandra",
    placeId: "ChIJu_rXgHz55zsR...",
    name: "BBlunt Salon & Academy",
    address: "Ground Floor, Plot No 311, Link Corner Building, Off Link Road, Bandra West, Mumbai, Maharashtra 400050",
    rating: 4.6,
    reviewsCount: 1420,
    phone: "+91 22 2640 0055",
    photos: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1521590832167-7bcbfea63334?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "10:00 AM - 08:30 PM",
      "Tuesday": "10:00 AM - 08:30 PM",
      "Wednesday": "10:00 AM - 08:30 PM",
      "Thursday": "10:00 AM - 08:30 PM",
      "Friday": "10:00 AM - 08:30 PM",
      "Saturday": "09:30 AM - 09:00 PM",
      "Sunday": "09:30 AM - 09:00 PM"
    },
    isClaimed: true,
    distance: "1.2 km",
    priceRange: "₹₹₹",
    featuredServices: ["Hair Cut", "Balayage", "Kerasmooth"],
    services: [
      { id: "s1", name: "Classic Haircut & Blowdry", price: 1200, duration: 45, category: "hair" },
      { id: "s2", name: "Premium Balayage Highlights", price: 6500, duration: 180, category: "hair" },
      { id: "s3", name: "Kérastase Hair Ritual (Spa)", price: 2800, duration: 60, category: "hair" },
      { id: "s4", name: "HydraFacial Glow Treatment", price: 4500, duration: 75, category: "skin" },
      { id: "s5", name: "Gel Nail Extensions", price: 2200, duration: 90, category: "nails" },
      { id: "s6", name: "Signature Groom/Bridal Makeup", price: 12000, duration: 120, category: "makeup" }
    ]
  },
  {
    id: "mumbai_jcb_juhu",
    placeId: "ChIJKYn4bW355zsR...",
    name: "Jean-Claude Biguine Salon & Spa",
    address: "First Floor, Juhu Supreme Shopping Centre, Gulmohar Road, Juhu, Mumbai, Maharashtra 400049",
    rating: 4.5,
    reviewsCount: 890,
    phone: "+91 22 6699 5555",
    photos: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfea63334?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "09:00 AM - 09:00 PM",
      "Tuesday": "09:00 AM - 09:00 PM",
      "Wednesday": "09:00 AM - 09:00 PM",
      "Thursday": "09:00 AM - 09:00 PM",
      "Friday": "09:00 AM - 09:00 PM",
      "Saturday": "09:00 AM - 09:00 PM",
      "Sunday": "09:00 AM - 09:00 PM"
    },
    isClaimed: true,
    distance: "3.4 km",
    priceRange: "₹₹₹₹",
    featuredServices: ["French Balayage", "Moroccan Hair Spa", "Luxury Pedicure"],
    services: [
      { id: "s11", name: "Director Haircut", price: 1800, duration: 50, category: "hair" },
      { id: "s12", name: "French Balayage (L'Oreal)", price: 7500, duration: 150, category: "hair" },
      { id: "s13", name: "Moroccan Oil Luxury Spa", price: 3200, duration: 60, category: "hair" },
      { id: "s14", name: "O3+ Bridal Skin Radiance Facial", price: 5500, duration: 90, category: "skin" },
      { id: "s15", name: "Luxury Shellac Pedicure", price: 1500, duration: 45, category: "nails" },
      { id: "s16", name: "Stress Relief Swedish Massage", price: 3500, duration: 60, category: "massage" }
    ]
  },
  {
    id: "mumbai_envi_andheri",
    placeId: "ChIJZ3Wj16X55zsR...",
    name: "Envi Salon & Spa - Infiniti Mall",
    address: "Unit 27, 2nd Floor, Infiniti Mall, Link Road, Andheri West, Mumbai, Maharashtra 400053",
    rating: 4.4,
    reviewsCount: 1105,
    phone: "+91 22 4016 7555",
    photos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1605497746444-ac9db453f4a6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "11:00 AM - 09:30 PM",
      "Tuesday": "11:00 AM - 09:30 PM",
      "Wednesday": "11:00 AM - 09:30 PM",
      "Thursday": "11:00 AM - 09:30 PM",
      "Friday": "11:00 AM - 09:30 PM",
      "Saturday": "10:30 AM - 10:00 PM",
      "Sunday": "10:30 AM - 10:00 PM"
    },
    isClaimed: false,
    distance: "5.1 km",
    priceRange: "₹₹",
    featuredServices: ["Unisex Hair Styling", "Global Hair Color", "De-Tan Treatment"],
    services: [
      { id: "s21", name: "Senior Stylist Haircut", price: 800, duration: 40, category: "hair" },
      { id: "s22", name: "Global Hair Color (Ammonia Free)", price: 3500, duration: 120, category: "hair" },
      { id: "s23", name: "Organic Charcoal Deep Facial", price: 2500, duration: 60, category: "skin" },
      { id: "s24", name: "Express Mani-Pedi Combo", price: 1200, duration: 50, category: "nails" },
      { id: "s25", name: "Party Glam Makeup Look", price: 4000, duration: 65, category: "makeup" }
    ]
  },
  {
    id: "mumbai_truefitt_colaba",
    placeId: "ChIJW9sA_0jR5zsR...",
    name: "Truefitt & Hill - Luxury Barbershop",
    address: "12, Forbes Street, Kala Ghoda, Colaba, Fort, Mumbai, Maharashtra 400001",
    rating: 4.8,
    reviewsCount: 650,
    phone: "+91 22 2281 1805",
    photos: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1593702295094-aec22df26535?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "08:00 AM - 08:00 PM",
      "Tuesday": "08:00 AM - 08:00 PM",
      "Wednesday": "08:00 AM - 08:00 PM",
      "Thursday": "08:00 AM - 08:00 PM",
      "Friday": "08:00 AM - 08:00 PM",
      "Saturday": "08:00 AM - 09:00 PM",
      "Sunday": "08:00 AM - 09:00 PM"
    },
    isClaimed: true,
    distance: "18.5 km",
    priceRange: "₹₹₹₹",
    featuredServices: ["Royal Shave", "Classic Haircut", "Head Massage"],
    services: [
      { id: "s31", name: "Royal Haircut", price: 2200, duration: 45, category: "hair" },
      { id: "s32", name: "The Royal Shave", price: 1800, duration: 40, category: "hair" },
      { id: "s33", name: "Royal Beard Grooming", price: 1400, duration: 30, category: "hair" },
      { id: "s34", name: "Royal Manicure & Pedicure", price: 3200, duration: 80, category: "nails" },
      { id: "s35", name: "Aromatherapy Scalp Massage", price: 1600, duration: 30, category: "massage" }
    ]
  },
  {
    id: "mumbai_femina_powai",
    placeId: "ChIJB81D1NPI5zsR...",
    name: "Femina Flaunt Salon by Times Group",
    address: "A-Wing, Central Avenue, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076",
    rating: 4.3,
    reviewsCount: 780,
    phone: "+91 22 4972 5555",
    photos: [
      "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1521590832167-7bcbfea63334?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "10:00 AM - 09:00 PM",
      "Tuesday": "10:00 AM - 09:00 PM",
      "Wednesday": "10:00 AM - 09:00 PM",
      "Thursday": "10:00 AM - 09:00 PM",
      "Friday": "10:00 AM - 09:00 PM",
      "Saturday": "09:30 AM - 09:30 PM",
      "Sunday": "09:30 AM - 09:30 PM"
    },
    isClaimed: false,
    distance: "10.2 km",
    priceRange: "₹₹",
    featuredServices: ["Sunkissed Highlights", "Power Facial", "Nail Lacquer"],
    services: [
      { id: "s41", name: "Creative Hair Stylist Cut", price: 900, duration: 45, category: "hair" },
      { id: "s42", name: "Sunkissed Balayage Treatment", price: 5500, duration: 150, category: "hair" },
      { id: "s43", name: "Skeyndor Power Glow Facial", price: 3800, duration: 75, category: "skin" },
      { id: "s44", name: "Spa Pedicure & Paraffin Hand Care", price: 1800, duration: 60, category: "nails" },
      { id: "s45", name: "High-Fashion Party Makeup", price: 6000, duration: 90, category: "makeup" }
    ]
  },
  {
    id: "mumbai_kapils_chembur",
    placeId: "ChIJ7-0bX53O5zsR...",
    name: "Kapil's Salon & Academy",
    address: "Unit 3, Central Boulevard, Chembur East, Mumbai, Maharashtra 400071",
    rating: 4.2,
    reviewsCount: 935,
    phone: "+91 22 2521 1122",
    photos: [
      "https://images.unsplash.com/photo-1605497746444-ac9db453f4a6?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"
    ],
    hours: {
      "Monday": "09:30 AM - 09:00 PM",
      "Tuesday": "09:30 AM - 09:00 PM",
      "Wednesday": "09:30 AM - 09:00 PM",
      "Thursday": "09:30 AM - 09:00 PM",
      "Friday": "09:30 AM - 09:00 PM",
      "Saturday": "09:30 AM - 09:30 PM",
      "Sunday": "09:30 AM - 09:30 PM"
    },
    isClaimed: true,
    distance: "12.0 km",
    priceRange: "₹",
    featuredServices: ["Affordable Haircut", "Keratin Treatment", "Pedicure"],
    services: [
      { id: "s51", name: "Classic Haircut & Wash", price: 500, duration: 30, category: "hair" },
      { id: "s52", name: "Lisse Design Keratin Therapy", price: 3999, duration: 120, category: "hair" },
      { id: "s53", name: "Fruit Glow Express Facial", price: 1200, duration: 40, category: "skin" },
      { id: "s54", name: "Deluxe Spa Pedicure", price: 800, duration: 45, category: "nails" },
      { id: "s55", name: "Light Day Makeup Look", price: 1800, duration: 45, category: "makeup" }
    ]
  }
];
