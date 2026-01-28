import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for MVP (use a database in production)
let galleryCircuits: GalleryCircuit[] = [
  // Seed with some example circuits
  {
    cid: 'QmExample1234567890abcdef',
    title: 'Private Age Verification',
    description: 'Prove you are above a certain age without revealing your actual birthdate.',
    author: 'zkdev.eth',
    timestamp: Date.now() - 86400000 * 2,
    tags: ['privacy', 'verification', 'age'],
    views: 1234,
    likes: 89,
    code: `fn main(birthdate: Field, current_date: pub Field, min_age: pub Field) {
    let age = (current_date - birthdate) / 31536000;
    assert(age as u32 >= min_age as u32);
}`,
  },
  {
    cid: 'QmExample2345678901bcdefg',
    title: 'Merkle Airdrop Claim',
    description: 'Claim tokens from an airdrop by proving membership in the Merkle tree.',
    author: 'anon.lens',
    timestamp: Date.now() - 86400000 * 5,
    tags: ['merkle', 'airdrop', 'defi'],
    views: 856,
    likes: 67,
    code: `use std::hash::poseidon;

fn main(
    root: pub Field,
    leaf: Field,
    path: [Field; 8],
    indices: [u1; 8]
) {
    let mut current = leaf;
    for i in 0..8 {
        if indices[i] == 0 {
            current = poseidon::bn254::hash_2([current, path[i]]);
        } else {
            current = poseidon::bn254::hash_2([path[i], current]);
        }
    }
    assert(current == root);
}`,
  },
];

interface GalleryCircuit {
  cid: string;
  title: string;
  description: string;
  author: string;
  timestamp: number;
  tags: string[];
  views: number;
  likes: number;
  code: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'recent';
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let results = [...galleryCircuits];

  // Apply search filter
  if (search) {
    const lowerSearch = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerSearch) ||
        c.description.toLowerCase().includes(lowerSearch) ||
        c.tags.some((t) => t.toLowerCase().includes(lowerSearch)) ||
        c.author.toLowerCase().includes(lowerSearch)
    );
  }

  // Sort based on filter
  switch (filter) {
    case 'popular':
      results.sort((a, b) => b.likes - a.likes);
      break;
    case 'trending':
      results.sort((a, b) => b.views - a.views);
      break;
    case 'recent':
    default:
      results.sort((a, b) => b.timestamp - a.timestamp);
      break;
  }

  // Apply pagination
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return NextResponse.json({
    circuits: results,
    total,
    offset,
    limit,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newCircuit: GalleryCircuit = {
      cid: body.cid,
      title: body.title || 'Untitled Circuit',
      description: body.description || '',
      author: body.author || 'Anonymous',
      timestamp: Date.now(),
      tags: body.tags || [],
      views: 0,
      likes: 0,
      code: body.code || '',
    };

    // Check for duplicate CID
    const existingIndex = galleryCircuits.findIndex((c) => c.cid === newCircuit.cid);
    if (existingIndex >= 0) {
      galleryCircuits[existingIndex] = newCircuit;
    } else {
      galleryCircuits.unshift(newCircuit);
    }

    // Keep only last 100 circuits
    if (galleryCircuits.length > 100) {
      galleryCircuits = galleryCircuits.slice(0, 100);
    }

    return NextResponse.json({ success: true, circuit: newCircuit });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Increment views
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { cid, action } = body;

    const circuit = galleryCircuits.find((c) => c.cid === cid);
    if (!circuit) {
      return NextResponse.json(
        { success: false, error: 'Circuit not found' },
        { status: 404 }
      );
    }

    if (action === 'view') {
      circuit.views++;
    } else if (action === 'like') {
      circuit.likes++;
    }

    return NextResponse.json({ success: true, circuit });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
