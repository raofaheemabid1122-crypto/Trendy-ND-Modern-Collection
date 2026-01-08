
import React from 'react';
import { Product } from './types';

export const BRANDS = [
  { name: 'J.', logo: 'https://picsum.photos/seed/j-logo/200/100' },
  { name: 'Gul Ahmed', logo: 'https://picsum.photos/seed/gul-logo/200/100' },
  { name: 'Edenrobe', logo: 'https://picsum.photos/seed/eden-logo/200/100' },
  { name: 'Sana Safinaz', logo: 'https://picsum.photos/seed/sana-logo/200/100' },
  { name: 'Maria B', logo: 'https://picsum.photos/seed/maria-logo/200/100' }
];

export const TESTIMONIALS = [
  {
    name: "Dr. Alizeh Shah",
    role: "Medical Professional",
    text: "The Imperial Crimson Silk exceeded my expectations. It is both professional and incredibly luxurious for evening events."
  },
  {
    name: "Omar Farooq",
    role: "Corporate Attorney",
    text: "Excellent service and authentic fabrics. The Khaddar collections are perfectly suited for my professional winter wardrobe."
  },
  {
    name: "Sarah Jenkins",
    role: "Creative Director",
    text: "Trendy ND Modern is a revelation. Their AI Stylist helped me choose a Karandi piece that gathered compliments all night."
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Imperial Crimson Silk',
    brand: 'Maria B',
    price: 18500,
    gender: 'Women',
    season: 'Winter',
    fabric: 'Silk',
    occasion: 'Festive',
    color: 'Crimson',
    image: 'https://images.pexels.com/photos/10309117/pexels-photo-10309117.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [],
    description: 'Radiate confidence in this meticulously handcrafted silk masterpiece. Designed with intricate gold thread work for the modern professional seeking high-profile festive elegance.',
    whatsIncluded: ['3m Premium Silk Shirt', '2.5m Hand-Woven Dupatta', '2.5m Dyed Trouser'],
    fabricCare: ['Dry clean only', 'Use steam iron on reverse'],
    isNew: true
  },
  {
    id: '2',
    name: 'Executive Slate Khaddar',
    brand: 'Gul Ahmed',
    price: 4500,
    originalPrice: 5500,
    gender: 'Men',
    season: 'Winter',
    fabric: 'Khaddar',
    occasion: 'Casual',
    color: 'Slate',
    image: 'https://images.pexels.com/photos/5935232/pexels-photo-5935232.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [],
    description: 'Precision-woven khaddar fabric designed for the leader who values both heritage and functionality. Durable, breathable, and commandingly sharp.',
    whatsIncluded: ['4.5m Unstitched Premium Fabric', 'Metallic Branding Buttons'],
    fabricCare: ['Cold wash', 'Medium iron'],
    isSale: true
  },
  {
    id: '3',
    name: 'Azure Luxe Lawn',
    brand: 'J.',
    price: 3200,
    gender: 'Women',
    season: 'Summer',
    fabric: 'Lawn',
    occasion: 'Casual',
    color: 'Azure',
    image: 'https://images.pexels.com/photos/10309109/pexels-photo-10309109.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [],
    description: 'Effortless sophistication for summer business luncheons. High-density lawn with minimalist digital motifs that speak volumes without saying a word.',
    whatsIncluded: ['3m Digital Print Shirt', '2.5m Voile Dupatta', '2m Plain Trouser'],
    fabricCare: ['Gentle cycle wash', 'Do not bleach'],
    isNew: true
  },
  {
    id: '4',
    name: 'Midnight Wool Edition',
    brand: 'Edenrobe',
    price: 8900,
    gender: 'Men',
    season: 'Winter',
    fabric: 'Wool',
    occasion: 'Festive',
    color: 'Midnight',
    image: 'https://images.pexels.com/photos/5935240/pexels-photo-5935240.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [],
    description: 'Rich wool-blend fabric curated for peak performance in cooler climates. This edition ensures a crisp silhouette for networking galas and evening soirées.',
    whatsIncluded: ['4m Signature Wool Fabric', 'Authentic Branding Patch'],
    fabricCare: ['Dry clean only', 'Store in a garment bag'],
  },
  {
    id: '5',
    name: 'Ivory Karandi Heritage',
    brand: 'Gul Ahmed',
    price: 12500,
    gender: 'Women',
    season: 'Winter',
    fabric: 'Karandi',
    occasion: 'Festive',
    color: 'Ivory',
    image: 'https://images.pexels.com/photos/10309121/pexels-photo-10309121.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [],
    description: 'A masterpiece of South Asian heritage. Hand-loomed ivory karandi paired with a signature pashmina-style shawl for the discerning professional collector.',
    whatsIncluded: ['3m Luxury Karandi Shirt', 'Pashmina Style Shawl', '2.5m Dyed Trouser'],
    fabricCare: ['Professional care only', 'Avoid moisture exposure'],
    isNew: true
  }
];

export const Icons = {
  Shipping: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h.293m.39 5.207l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0z" />
    </svg>
  ),
  Original: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Returns: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Search: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
};
