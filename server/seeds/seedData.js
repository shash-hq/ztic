import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import Show from '../models/Show.js';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';

dotenv.config();

const ROW_LABELS = ['α', 'β', 'γ', 'δ', 'ε'];

const EVENTS_DATA = [
  {
    title: 'The Brutalist Symphony',
    slug: 'the-brutalist-symphony',
    category: 'event',
    description: 'A collision of orchestral brutalism and industrial architecture. One night only.',
    location: 'Berlin / Tempelhof',
    heroImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    isTrending: true,
    tags: ['SELLING FAST', 'LIVE'],
  },
  {
    title: 'Midnight Noir Jazz',
    slug: 'midnight-noir-jazz',
    category: 'event',
    description: 'Late-night jazz draped in monochrome. The city does not sleep.',
    location: 'Tokyo / Shinjuku',
    heroImage: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800&q=80',
    isTrending: true,
    tags: ['NEW'],
  },
  {
    title: 'Architects of Comedy',
    slug: 'architects-of-comedy',
    category: 'comedy',
    description: 'Stand-up at the intersection of chaos theory and slapstick. Upcoming collective.',
    location: 'London / Barbican',
    heroImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    isTrending: false,
    tags: ['UPCOMING'],
  },
  {
    title: 'Underground Kabuki Sessions',
    slug: 'underground-kabuki-sessions',
    category: 'cinema',
    description: 'Classical Japanese theatre reimagined through concrete minimalism and industrial soundscapes.',
    location: 'Osaka / Grand Theatre',
    heroImage: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80',
    isTrending: true,
    tags: ['ARCHIVE MEMBERS ONLY'],
  },
  {
    title: 'Structural Tension Exhibition',
    slug: 'structural-tension-exhibition',
    category: 'event',
    description: 'A gallery of functional anxiety. Architecture as performance art.',
    location: 'Seoul / MMCA',
    heroImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    isTrending: false,
    tags: ['EXHIBITION'],
  },
];

const LAYOUT = {
  rows: 5,
  cols: 12,
  aisleAfterCol: 5,
  premiumRows: [0],        // Row α is premium
  premiumPrice: 5000,
  standardPrice: 3500,
};

// Seats to pre-book so the map looks realistic
const PREBOOKED_POSITIONS = [
  { row: 0, col: 2 }, { row: 0, col: 8 },
  { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 10 },
  { row: 2, col: 7 },
  { row: 3, col: 1 }, { row: 3, col: 9 },
  { row: 4, col: 5 }, { row: 4, col: 6 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected to MongoDB. Starting seed...\n');

  // Wipe existing data
  await Promise.all([
    Event.deleteMany({}),
    Show.deleteMany({}),
    Seat.deleteMany({}),
    Booking.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing collections.');

  for (const evtData of EVENTS_DATA) {
    // 1. Create Event
    const event = await Event.create(evtData);

    // 2. Create 2 shows per event (different dates)
    const showDates = [
      new Date('2025-08-24T19:00:00Z'),
      new Date('2025-08-25T20:30:00Z'),
    ];

    for (const date of showDates) {
      const totalSeats = LAYOUT.rows * LAYOUT.cols;

      const show = await Show.create({
        event: event._id,
        date,
        venueLayout: LAYOUT,
        totalSeats,
        availableSeats: totalSeats - PREBOOKED_POSITIONS.length,
        status: 'on_sale',
      });

      // 3. Create all seats
      const seatDocs = [];
      for (let r = 0; r < LAYOUT.rows; r++) {
        for (let c = 0; c < LAYOUT.cols; c++) {
          const isPremiumRow = LAYOUT.premiumRows.includes(r);
          const isPrebooked = PREBOOKED_POSITIONS.some(
            (p) => p.row === r && p.col === c
          );
          seatDocs.push({
            show: show._id,
            row: r,
            col: c,
            label: `${ROW_LABELS[r]}-${c + 1}`,
            type: isPremiumRow ? 'premium' : 'standard',
            price: isPremiumRow ? LAYOUT.premiumPrice : LAYOUT.standardPrice,
            status: isPrebooked ? 'booked' : 'available',
          });
        }
      }
      await Seat.insertMany(seatDocs);

      // 4. Link show back to event
      await Event.findByIdAndUpdate(event._id, {
        $push: { shows: show._id },
      });

      console.log(`   ✅ Show seeded: ${event.title} — ${date.toDateString()}`);
    }

    console.log(`✅ Event seeded: "${event.title}"\n`);
  }

  console.log('🎉 Seed complete. ZTic database is ready.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
