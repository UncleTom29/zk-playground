import type { Tutorial, Lesson } from '@/types';

// Tutorial 1: Introduction to ZK Proofs (Beginner)
const introToZKTutorial: Tutorial = {
  id: 'intro-to-zk',
  title: 'Introduction to Zero-Knowledge Proofs',
  description: 'Learn the fundamentals of ZK proofs, public vs private inputs, and basic constraints.',
  difficulty: 'beginner',
  estimatedTime: '30 min',
  lessons: [
    {
      id: 'intro-1-what-is-zk',
      title: 'What is a Zero-Knowledge Proof?',
      content: `# What is a Zero-Knowledge Proof?

A **Zero-Knowledge Proof (ZKP)** is a cryptographic method that allows one party (the prover) to prove to another party (the verifier) that a statement is true, without revealing any additional information beyond the validity of the statement itself.

## Key Properties

1. **Completeness**: If the statement is true, an honest prover can convince the verifier.
2. **Soundness**: If the statement is false, no dishonest prover can convince the verifier.
3. **Zero-Knowledge**: The verifier learns nothing beyond the truth of the statement.

## Real-World Analogy

Imagine proving you know a password without revealing it:
- You could type it into a system that only says "correct" or "incorrect"
- The verifier learns you know the password, but not what it is

## Your First Circuit

Let's start with the simplest possible circuit - proving you know a number that squares to a given value.

**Challenge**: Complete the circuit below to prove knowledge of \`x\` where \`x² = y\`.
`,
      starterCode: `fn main(x: Field, y: pub Field) {
    // TODO: Assert that x squared equals y

}`,
      solution: `fn main(x: Field, y: pub Field) {
    // Assert that x squared equals y
    assert(x * x == y);
}`,
      challenge: {
        description: 'Complete the circuit to prove knowledge of x where x² = y',
        testCases: [
          { inputs: { x: '3', y: '9' }, description: '3² = 9', shouldPass: true },
          { inputs: { x: '5', y: '25' }, description: '5² = 25', shouldPass: true },
          { inputs: { x: '4', y: '15' }, description: '4² ≠ 15 (should fail)', shouldPass: false },
        ],
        requirements: ['Use assert statement', 'Multiply x by itself'],
      },
      hints: [
        'Use the assert() function to make constraints',
        'In Noir, multiplication is done with the * operator',
        'The constraint should check that x * x == y',
      ],
    },
    {
      id: 'intro-2-public-private',
      title: 'Public vs Private Inputs',
      content: `# Public vs Private Inputs

In zero-knowledge circuits, inputs can be classified as:

## Private Inputs
- Known only to the prover
- Never revealed to the verifier
- Used for secret knowledge proofs
- Default in Noir (no keyword needed)

## Public Inputs
- Known to both prover and verifier
- Part of the statement being proved
- Marked with \`pub\` keyword in Noir

## Example Scenario

**Private Banking**: Prove your balance exceeds a threshold without revealing your exact balance.

\`\`\`noir
fn main(
    balance: Field,           // Private - your actual balance
    threshold: pub Field      // Public - minimum required
) {
    assert(balance >= threshold);
}
\`\`\`

**Challenge**: Create a circuit that proves you're an adult (age >= 18) without revealing your exact age.
`,
      starterCode: `fn main(age: Field, min_age: pub Field) {
    // TODO: Prove age >= min_age without revealing exact age

}`,
      solution: `fn main(age: Field, min_age: pub Field) {
    // Prove age >= min_age without revealing exact age
    assert(age >= min_age);
}`,
      challenge: {
        description: 'Prove age is at least min_age without revealing the exact age',
        testCases: [
          { inputs: { age: '25', min_age: '18' }, description: '25 >= 18', shouldPass: true },
          { inputs: { age: '18', min_age: '18' }, description: '18 >= 18', shouldPass: true },
          { inputs: { age: '16', min_age: '18' }, description: '16 < 18 (should fail)', shouldPass: false },
        ],
        requirements: ['age should be private', 'min_age should be public', 'Use comparison operator'],
      },
      hints: [
        'Notice that age has no pub keyword - it\'s private by default',
        'Use >= for greater than or equal comparison',
        'The verifier only sees min_age, not the actual age',
      ],
    },
    {
      id: 'intro-3-constraints',
      title: 'Understanding Constraints',
      content: `# Understanding Constraints

Circuits are built from **constraints** - mathematical relationships that must hold true for the proof to be valid.

## Types of Constraints

### Equality Constraints
\`\`\`noir
assert(a == b);    // a must equal b
\`\`\`

### Arithmetic Constraints
\`\`\`noir
assert(a + b == c);   // Addition
assert(a * b == c);   // Multiplication
assert(a - b == c);   // Subtraction
\`\`\`

### Comparison Constraints
\`\`\`noir
assert(a < b);     // Less than
assert(a > b);     // Greater than
assert(a <= b);    // Less than or equal
assert(a >= b);    // Greater than or equal
\`\`\`

### Boolean Constraints
\`\`\`noir
assert(flag == true);
assert(!invalid);
\`\`\`

## Multiple Constraints

Circuits can have multiple constraints that all must be satisfied:

\`\`\`noir
fn main(a: Field, b: Field, sum: pub Field, product: pub Field) {
    assert(a + b == sum);
    assert(a * b == product);
}
\`\`\`

**Challenge**: Create a circuit that verifies a simple linear equation: \`2x + 3 = result\`
`,
      starterCode: `fn main(x: Field, result: pub Field) {
    // TODO: Verify that 2*x + 3 == result

}`,
      solution: `fn main(x: Field, result: pub Field) {
    // Verify that 2*x + 3 == result
    assert(2 * x + 3 == result);
}`,
      challenge: {
        description: 'Verify that 2*x + 3 equals the result',
        testCases: [
          { inputs: { x: '5', result: '13' }, description: '2*5 + 3 = 13', shouldPass: true },
          { inputs: { x: '0', result: '3' }, description: '2*0 + 3 = 3', shouldPass: true },
          { inputs: { x: '10', result: '25' }, description: '2*10 + 3 ≠ 25 (should fail)', shouldPass: false },
        ],
        requirements: ['Use multiplication and addition', 'Single assert statement'],
      },
      hints: [
        'Combine multiple operations in one expression',
        'Order of operations: multiplication before addition',
        'Use parentheses if needed for clarity',
      ],
    },
  ],
};

// Tutorial 2: Merkle Trees & Privacy (Intermediate)
const merkleTreeTutorial: Tutorial = {
  id: 'merkle-trees',
  title: 'Merkle Trees & Privacy',
  description: 'Learn about Merkle trees, membership proofs, and privacy applications in ZK.',
  difficulty: 'intermediate',
  estimatedTime: '45 min',
  lessons: [
    {
      id: 'merkle-1-introduction',
      title: 'Introduction to Merkle Trees',
      content: `# Introduction to Merkle Trees

A **Merkle Tree** is a data structure that allows efficient and secure verification of data integrity.

## Structure

\`\`\`
        Root Hash
       /        \\
    Hash01      Hash23
    /    \\      /    \\
 Hash0  Hash1  Hash2  Hash3
   |      |      |      |
 Data0  Data1  Data2  Data3
\`\`\`

## Key Properties

1. **Root Hash**: Single hash representing all data
2. **Proof Path**: O(log n) hashes to prove membership
3. **Tamper Evident**: Any change affects the root

## Privacy Application

With ZK proofs, you can prove:
- "I know a leaf in this tree"
- Without revealing which leaf!

**Challenge**: Compute the hash of two values combined.
`,
      starterCode: `use std::hash::poseidon;

fn main(left: Field, right: Field, expected_hash: pub Field) {
    // TODO: Compute hash of (left, right) and verify it matches expected_hash

}`,
      solution: `use std::hash::poseidon;

fn main(left: Field, right: Field, expected_hash: pub Field) {
    // Compute hash of (left, right) and verify it matches expected_hash
    let computed_hash = poseidon::bn254::hash_2([left, right]);
    assert(computed_hash == expected_hash);
}`,
      challenge: {
        description: 'Compute the Poseidon hash of two values and verify it matches',
        testCases: [
          { inputs: { left: '1', right: '2', expected_hash: '0' }, description: 'Hash verification', shouldPass: true },
        ],
        requirements: ['Use Poseidon hash function', 'Verify hash matches expected value'],
      },
      hints: [
        'Import poseidon from std::hash',
        'Use poseidon::bn254::hash_2() for hashing two elements',
        'The function takes an array of two elements',
      ],
    },
    {
      id: 'merkle-2-membership',
      title: 'Merkle Membership Proofs',
      content: `# Merkle Membership Proofs

A **membership proof** demonstrates that a leaf exists in a Merkle tree without revealing the leaf's position or value to the verifier.

## Proof Components

1. **Leaf**: The value you're proving membership for
2. **Path**: Sibling hashes from leaf to root
3. **Index bits**: Which side (left/right) at each level

## Verification Process

\`\`\`noir
fn verify_path(
    leaf: Field,
    path: [Field; N],
    indices: [bool; N]
) -> Field {
    let mut current = leaf;
    for i in 0..N {
        let sibling = path[i];
        if indices[i] {
            current = hash(sibling, current);
        } else {
            current = hash(current, sibling);
        }
    }
    current  // Returns computed root
}
\`\`\`

**Challenge**: Implement a 2-level Merkle proof verification.
`,
      starterCode: `use std::hash::poseidon;

fn main(
    leaf: Field,
    sibling1: Field,
    sibling2: Field,
    is_left1: bool,
    is_left2: bool,
    root: pub Field
) {
    // TODO: Verify the Merkle path from leaf to root
    // Level 1: hash leaf with sibling1
    // Level 2: hash result with sibling2
    // Compare final result with root

}`,
      solution: `use std::hash::poseidon;

fn main(
    leaf: Field,
    sibling1: Field,
    sibling2: Field,
    is_left1: bool,
    is_left2: bool,
    root: pub Field
) {
    // Level 1: hash leaf with sibling1
    let level1 = if is_left1 {
        poseidon::bn254::hash_2([sibling1, leaf])
    } else {
        poseidon::bn254::hash_2([leaf, sibling1])
    };

    // Level 2: hash result with sibling2
    let level2 = if is_left2 {
        poseidon::bn254::hash_2([sibling2, level1])
    } else {
        poseidon::bn254::hash_2([level1, sibling2])
    };

    // Compare final result with root
    assert(level2 == root);
}`,
      challenge: {
        description: 'Verify a 2-level Merkle proof',
        testCases: [
          { inputs: { leaf: '1', sibling1: '2', sibling2: '3', is_left1: 'false', is_left2: 'false', root: '0' }, description: 'Valid proof', shouldPass: true },
        ],
        requirements: ['Use conditional hashing based on position', 'Verify computed root matches'],
      },
      hints: [
        'Use if-else to determine hash order',
        'is_left indicates if the current node is a left child',
        'Hash order matters: (left, right)',
      ],
    },
    {
      id: 'merkle-3-private-set',
      title: 'Private Set Membership',
      content: `# Private Set Membership

One of the most powerful applications of Merkle trees in ZK is **private set membership**.

## Use Cases

1. **Airdrops**: Prove you're eligible without revealing your address
2. **Voting**: Prove you're a registered voter anonymously
3. **Access Control**: Prove group membership privately

## Privacy Guarantees

The verifier learns:
- The root hash (public commitment to the set)
- That the prover knows a valid leaf

The verifier does NOT learn:
- Which specific leaf the prover knows
- The prover's position in the tree
- Any other leaves in the tree

**Challenge**: Create a simple allowlist check circuit.
`,
      starterCode: `fn main(
    secret_id: Field,
    allowlist_hash: pub Field
) {
    // TODO: Hash the secret_id and verify it matches the allowlist_hash
    // This is a simplified version - in practice, you'd use a Merkle tree

}`,
      solution: `use std::hash::poseidon;

fn main(
    secret_id: Field,
    allowlist_hash: pub Field
) {
    // Hash the secret_id and verify it matches the allowlist_hash
    let computed_hash = poseidon::bn254::hash_1([secret_id]);
    assert(computed_hash == allowlist_hash);
}`,
      challenge: {
        description: 'Verify secret_id is in the allowlist by checking its hash',
        testCases: [
          { inputs: { secret_id: '12345', allowlist_hash: '0' }, description: 'Valid membership', shouldPass: true },
        ],
        requirements: ['Hash the secret ID', 'Compare with allowlist hash'],
      },
      hints: [
        'This is a simplified single-element check',
        'In practice, you would use a full Merkle tree',
        'The hash acts as a commitment to the ID',
      ],
    },
  ],
};

// Tutorial 3: Hash Functions in ZK (Intermediate)
const hashFunctionsTutorial: Tutorial = {
  id: 'hash-functions',
  title: 'Hash Functions in ZK Circuits',
  description: 'Master ZK-friendly hash functions like Poseidon, Pedersen, and their applications.',
  difficulty: 'intermediate',
  estimatedTime: '40 min',
  lessons: [
    {
      id: 'hash-1-intro',
      title: 'ZK-Friendly Hash Functions',
      content: `# ZK-Friendly Hash Functions

Traditional hash functions (SHA256, Keccak) are computationally expensive in ZK circuits. ZK-friendly alternatives are optimized for constraint systems.

## Common ZK Hash Functions

### Poseidon
- Most widely used in ZK
- Optimized for prime fields
- Low constraint count
- Algebraic structure

### Pedersen
- Based on elliptic curves
- Homomorphic properties
- Good for commitments

### MiMC
- Simple structure
- Fewer constraints
- Used in some rollups

## Noir Hash Functions

\`\`\`noir
use std::hash::poseidon;
use std::hash::pedersen;

// Poseidon hash
let hash1 = poseidon::bn254::hash_1([value]);
let hash2 = poseidon::bn254::hash_2([a, b]);

// Pedersen hash
let ped_hash = pedersen::hash([a, b, c]);
\`\`\`

**Challenge**: Create a commitment scheme using Poseidon hash.
`,
      starterCode: `use std::hash::poseidon;

fn main(
    secret: Field,
    blinding: Field,
    commitment: pub Field
) {
    // TODO: Create a commitment as hash(secret, blinding)
    // Verify it matches the public commitment

}`,
      solution: `use std::hash::poseidon;

fn main(
    secret: Field,
    blinding: Field,
    commitment: pub Field
) {
    // Create a commitment as hash(secret, blinding)
    let computed = poseidon::bn254::hash_2([secret, blinding]);
    // Verify it matches the public commitment
    assert(computed == commitment);
}`,
      challenge: {
        description: 'Create and verify a hash commitment',
        testCases: [
          { inputs: { secret: '42', blinding: '12345', commitment: '0' }, description: 'Valid commitment', shouldPass: true },
        ],
        requirements: ['Use Poseidon hash with two inputs', 'Verify commitment matches'],
      },
      hints: [
        'A commitment hides a value with a random blinding factor',
        'Use poseidon::bn254::hash_2 for two-element hash',
        'The blinding factor ensures uniqueness',
      ],
    },
    {
      id: 'hash-2-preimage',
      title: 'Hash Preimage Proofs',
      content: `# Hash Preimage Proofs

A **preimage** is the input to a hash function. Proving knowledge of a preimage without revealing it is a fundamental ZK application.

## Applications

1. **Password Verification**: Prove you know a password
2. **Secret Sharing**: Prove knowledge of a secret
3. **Commitment Reveal**: Prove you committed to a value

## Security Properties

\`\`\`
hash(preimage) = digest

Given: digest (public)
Prove: I know preimage such that hash(preimage) = digest
Reveal: Nothing about preimage
\`\`\`

**Challenge**: Prove knowledge of two numbers that hash to a given digest.
`,
      starterCode: `use std::hash::poseidon;

fn main(
    preimage1: Field,
    preimage2: Field,
    digest: pub Field
) {
    // TODO: Prove you know preimage1 and preimage2 that hash to digest

}`,
      solution: `use std::hash::poseidon;

fn main(
    preimage1: Field,
    preimage2: Field,
    digest: pub Field
) {
    // Prove you know preimage1 and preimage2 that hash to digest
    let computed = poseidon::bn254::hash_2([preimage1, preimage2]);
    assert(computed == digest);
}`,
      challenge: {
        description: 'Prove knowledge of preimages without revealing them',
        testCases: [
          { inputs: { preimage1: '100', preimage2: '200', digest: '0' }, description: 'Valid preimage proof', shouldPass: true },
        ],
        requirements: ['Hash both preimages together', 'Compare with public digest'],
      },
      hints: [
        'The preimages are private (no pub keyword)',
        'Only the digest is public',
        'This proves knowledge without revealing the actual values',
      ],
    },
    {
      id: 'hash-3-chaining',
      title: 'Hash Chains and Accumulators',
      content: `# Hash Chains and Accumulators

**Hash chains** link multiple values together cryptographically, enabling sequential verification and state transitions.

## Hash Chain Structure

\`\`\`
H0 = hash(initial)
H1 = hash(H0, value1)
H2 = hash(H1, value2)
...
Hn = hash(Hn-1, valueN)
\`\`\`

## Applications

1. **Blockchain headers**: Each block references the previous
2. **VDFs**: Verifiable delay functions
3. **State transitions**: Prove sequence of operations

**Challenge**: Verify a 3-step hash chain.
`,
      starterCode: `use std::hash::poseidon;

fn main(
    initial: Field,
    step1: Field,
    step2: Field,
    step3: Field,
    final_hash: pub Field
) {
    // TODO: Compute the hash chain:
    // h0 = hash(initial)
    // h1 = hash(h0, step1)
    // h2 = hash(h1, step2)
    // h3 = hash(h2, step3)
    // Verify h3 == final_hash

}`,
      solution: `use std::hash::poseidon;

fn main(
    initial: Field,
    step1: Field,
    step2: Field,
    step3: Field,
    final_hash: pub Field
) {
    // Compute the hash chain
    let h0 = poseidon::bn254::hash_1([initial]);
    let h1 = poseidon::bn254::hash_2([h0, step1]);
    let h2 = poseidon::bn254::hash_2([h1, step2]);
    let h3 = poseidon::bn254::hash_2([h2, step3]);

    // Verify the final hash
    assert(h3 == final_hash);
}`,
      challenge: {
        description: 'Verify a 3-step hash chain computation',
        testCases: [
          { inputs: { initial: '1', step1: '2', step2: '3', step3: '4', final_hash: '0' }, description: 'Valid hash chain', shouldPass: true },
        ],
        requirements: ['Chain hashes sequentially', 'Use intermediate results'],
      },
      hints: [
        'Start with hash of initial value',
        'Each step combines previous hash with new value',
        'Final result should match the public hash',
      ],
    },
  ],
};

// Export all tutorials
export const tutorials: Tutorial[] = [
  introToZKTutorial,
  merkleTreeTutorial,
  hashFunctionsTutorial,
];

// Helper functions
export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find(t => t.id === id);
}

export function getLessonById(tutorialId: string, lessonId: string): Lesson | undefined {
  const tutorial = getTutorialById(tutorialId);
  return tutorial?.lessons.find(l => l.id === lessonId);
}

export function getNextLesson(tutorialId: string, currentLessonId: string): Lesson | undefined {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return undefined;

  const currentIndex = tutorial.lessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex >= tutorial.lessons.length - 1) return undefined;

  return tutorial.lessons[currentIndex + 1];
}

export function getPreviousLesson(tutorialId: string, currentLessonId: string): Lesson | undefined {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return undefined;

  const currentIndex = tutorial.lessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex <= 0) return undefined;

  return tutorial.lessons[currentIndex - 1];
}

export function getTutorialProgress(tutorialId: string, completedLessons: string[]): number {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return 0;

  return Math.round((completedLessons.length / tutorial.lessons.length) * 100);
}

export default tutorials;
