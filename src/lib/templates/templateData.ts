import type { Template } from '@/types';

// ========================
// BASIC TEMPLATES (5)
// ========================

const helloWorldTemplate: Template = {
  id: 'hello-world',
  name: 'Hello World',
  description: 'The simplest circuit: prove you know x where x² = y',
  category: 'basic',
  difficulty: 'beginner',
  code: `// Hello World Circuit
// Proves knowledge of x such that x² = y

fn main(x: Field, y: pub Field) {
    // Assert that x squared equals y
    assert(x * x == y);
}

// Example: x = 3, y = 9 (3² = 9)
`,
  sampleInputs: { x: '3', y: '9' },
  tags: ['simple', 'arithmetic', 'beginner'],
};

const ageVerificationTemplate: Template = {
  id: 'age-verification',
  name: 'Age Verification',
  description: 'Prove you are at least a certain age without revealing your exact age',
  category: 'basic',
  difficulty: 'beginner',
  code: `// Age Verification Circuit
// Proves age >= minimum_age without revealing exact age

fn main(age: Field, minimum_age: pub Field) {
    // Private input: your actual age
    // Public input: minimum required age

    // Assert age is at least minimum_age
    assert(age >= minimum_age);
}

// Example: Prove you're at least 18
// age = 25, minimum_age = 18
`,
  sampleInputs: { age: '25', minimum_age: '18' },
  tags: ['privacy', 'comparison', 'identity'],
};

const rangeProofTemplate: Template = {
  id: 'range-proof',
  name: 'Range Proof',
  description: 'Prove a value lies within a specific range [min, max]',
  category: 'basic',
  difficulty: 'beginner',
  code: `// Range Proof Circuit
// Proves min <= value <= max without revealing the value

fn main(
    value: Field,
    min: pub Field,
    max: pub Field
) {
    // Assert value is at least min
    assert(value >= min);

    // Assert value is at most max
    assert(value <= max);
}

// Example: Prove value is between 10 and 100
// value = 42, min = 10, max = 100
`,
  sampleInputs: { value: '42', min: '10', max: '100' },
  tags: ['range', 'bounds', 'comparison'],
};

const equalityCheckTemplate: Template = {
  id: 'equality-check',
  name: 'Equality Check',
  description: 'Prove two private values are equal without revealing them',
  category: 'basic',
  difficulty: 'beginner',
  code: `// Equality Check Circuit
// Proves two private values are equal

fn main(
    value_a: Field,
    value_b: Field,
    are_equal: pub bool
) {
    // Check if values are equal
    let equal = value_a == value_b;

    // Assert the result matches expected
    assert(equal == are_equal);
}

// Example: Check if two secrets match
// value_a = 12345, value_b = 12345, are_equal = true
`,
  sampleInputs: { value_a: '12345', value_b: '12345', are_equal: 'true' },
  tags: ['equality', 'comparison', 'simple'],
};

const hashPreimageTemplate: Template = {
  id: 'hash-preimage',
  name: 'Hash Preimage',
  description: 'Prove knowledge of a hash preimage without revealing it',
  category: 'basic',
  difficulty: 'beginner',
  code: `use std::hash::poseidon;

// Hash Preimage Circuit
// Proves knowledge of a value that hashes to a public digest

fn main(preimage: Field, digest: pub Field) {
    // Compute hash of the preimage
    let computed_hash = poseidon::bn254::hash_1([preimage]);

    // Assert it matches the public digest
    assert(computed_hash == digest);
}

// Proves: "I know a value that hashes to this digest"
// Without revealing: the actual preimage value
`,
  sampleInputs: { preimage: '12345', digest: '0' },
  tags: ['hash', 'preimage', 'poseidon'],
};

// ========================
// CRYPTOGRAPHY TEMPLATES (4)
// ========================

const ecdsaVerificationTemplate: Template = {
  id: 'ecdsa-verification',
  name: 'ECDSA Signature Verification',
  description: 'Verify an ECDSA signature over a message hash',
  category: 'cryptography',
  difficulty: 'advanced',
  code: `use std::ecdsa_secp256k1;

// ECDSA Signature Verification Circuit
// Verifies a signature without revealing the private key

fn main(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    message_hash: pub [u8; 32]
) {
    // Verify the ECDSA signature
    let valid = ecdsa_secp256k1::verify_signature(
        pub_key_x,
        pub_key_y,
        signature,
        message_hash
    );

    assert(valid);
}

// This proves a valid signature exists without revealing it
`,
  sampleInputs: {
    pub_key_x: Array(32).fill(0),
    pub_key_y: Array(32).fill(0),
    signature: Array(64).fill(0),
    message_hash: Array(32).fill(0),
  },
  tags: ['ecdsa', 'signature', 'cryptography', 'verification'],
};

const schnorrSignatureTemplate: Template = {
  id: 'schnorr-signature',
  name: 'Schnorr Signature',
  description: 'Verify a Schnorr signature on the Grumpkin curve',
  category: 'cryptography',
  difficulty: 'advanced',
  code: `use std::schnorr;
use std::hash::poseidon;

// Schnorr Signature Verification
// More efficient than ECDSA in ZK circuits

fn main(
    message: Field,
    pub_key_x: Field,
    pub_key_y: Field,
    signature_s: Field,
    signature_e: Field
) {
    // Hash the message
    let message_hash = poseidon::bn254::hash_1([message]);

    // Convert to bytes for verification
    let hash_bytes = message_hash.to_be_bytes();

    // Verify Schnorr signature
    // Note: Actual implementation depends on curve used
    assert(pub_key_x != 0);  // Placeholder check
}

// Schnorr signatures are linear and more ZK-friendly
`,
  sampleInputs: {
    message: '12345',
    pub_key_x: '1',
    pub_key_y: '2',
    signature_s: '3',
    signature_e: '4',
  },
  tags: ['schnorr', 'signature', 'grumpkin'],
};

const hashChainTemplate: Template = {
  id: 'hash-chain',
  name: 'Hash Chain Verification',
  description: 'Verify a sequence of hash operations forming a chain',
  category: 'cryptography',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Hash Chain Verification
// Proves correct computation of a hash chain

fn main(
    initial_value: Field,
    steps: [Field; 4],
    final_hash: pub Field
) {
    // Start with initial value
    let mut current = poseidon::bn254::hash_1([initial_value]);

    // Chain through each step
    for i in 0..4 {
        current = poseidon::bn254::hash_2([current, steps[i]]);
    }

    // Verify final hash
    assert(current == final_hash);
}

// Applications: VDFs, state transitions, blockchain headers
`,
  sampleInputs: {
    initial_value: '1',
    steps: ['2', '3', '4', '5'],
    final_hash: '0',
  },
  tags: ['hash', 'chain', 'vdf', 'blockchain'],
};

const commitmentSchemeTemplate: Template = {
  id: 'commitment-scheme',
  name: 'Commitment Scheme',
  description: 'Create and verify Pedersen-style commitments',
  category: 'cryptography',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Commitment Scheme Circuit
// commit = hash(value, blinding)

fn main(
    value: Field,
    blinding: Field,
    commitment: pub Field
) {
    // Compute commitment
    let computed = poseidon::bn254::hash_2([value, blinding]);

    // Verify commitment
    assert(computed == commitment);
}

// Properties:
// - Hiding: commitment reveals nothing about value
// - Binding: cannot open to different value
`,
  sampleInputs: {
    value: '42',
    blinding: '98765',
    commitment: '0',
  },
  tags: ['commitment', 'pedersen', 'hiding', 'binding'],
};

// ========================
// PRIVACY TEMPLATES (3)
// ========================

const merkleTreeMembershipTemplate: Template = {
  id: 'merkle-membership',
  name: 'Merkle Tree Membership',
  description: 'Prove membership in a Merkle tree without revealing which leaf',
  category: 'privacy',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Merkle Tree Membership Proof
// Depth 4 tree (16 leaves)

fn main(
    leaf: Field,
    path: [Field; 4],
    indices: [bool; 4],
    root: pub Field
) {
    // Compute root from leaf and path
    let mut current = leaf;

    for i in 0..4 {
        let sibling = path[i];
        if indices[i] {
            // Current node is right child
            current = poseidon::bn254::hash_2([sibling, current]);
        } else {
            // Current node is left child
            current = poseidon::bn254::hash_2([current, sibling]);
        }
    }

    // Verify computed root matches
    assert(current == root);
}

// Proves: "I know a leaf in this tree"
// Without revealing: which leaf or its position
`,
  sampleInputs: {
    leaf: '12345',
    path: ['1', '2', '3', '4'],
    indices: [false, true, false, true],
    root: '0',
  },
  tags: ['merkle', 'membership', 'tree', 'privacy'],
};

const anonymousVotingTemplate: Template = {
  id: 'anonymous-voting',
  name: 'Anonymous Voting',
  description: 'Cast a vote while proving eligibility without revealing identity',
  category: 'privacy',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Anonymous Voting Circuit
// Proves: eligible voter casting a valid vote

fn main(
    // Private: voter's secret identity
    voter_secret: Field,
    voter_nullifier: Field,

    // Private: Merkle proof of registration
    merkle_path: [Field; 3],
    merkle_indices: [bool; 3],

    // Public inputs
    vote_option: pub Field,           // 0 or 1 (binary vote)
    voters_root: pub Field,           // Merkle root of eligible voters
    nullifier_hash: pub Field         // Prevents double voting
) {
    // 1. Verify vote is valid (0 or 1)
    assert((vote_option == 0) | (vote_option == 1));

    // 2. Compute voter's leaf commitment
    let voter_commitment = poseidon::bn254::hash_2([voter_secret, voter_nullifier]);

    // 3. Verify Merkle membership
    let mut current = voter_commitment;
    for i in 0..3 {
        let sibling = merkle_path[i];
        if merkle_indices[i] {
            current = poseidon::bn254::hash_2([sibling, current]);
        } else {
            current = poseidon::bn254::hash_2([current, sibling]);
        }
    }
    assert(current == voters_root);

    // 4. Verify nullifier for double-vote prevention
    let computed_nullifier = poseidon::bn254::hash_1([voter_nullifier]);
    assert(computed_nullifier == nullifier_hash);
}

// The nullifier hash is stored on-chain to prevent double voting
// But it cannot be linked back to the voter's identity
`,
  sampleInputs: {
    voter_secret: '12345',
    voter_nullifier: '67890',
    merkle_path: ['1', '2', '3'],
    merkle_indices: [false, true, false],
    vote_option: '1',
    voters_root: '0',
    nullifier_hash: '0',
  },
  tags: ['voting', 'anonymous', 'nullifier', 'democracy'],
};

const privateTransferTemplate: Template = {
  id: 'private-transfer',
  name: 'Private Token Transfer',
  description: 'Transfer tokens while hiding sender, receiver, and amount',
  category: 'privacy',
  difficulty: 'advanced',
  code: `use std::hash::poseidon;

// Private Token Transfer (simplified UTXO model)
// Similar to Tornado Cash / Zcash concepts

fn main(
    // Input note (being spent)
    input_amount: Field,
    input_secret: Field,
    input_nullifier: Field,
    input_path: [Field; 3],
    input_indices: [bool; 3],

    // Output notes (being created)
    output1_amount: Field,
    output1_secret: Field,
    output2_amount: Field,  // Change
    output2_secret: Field,

    // Public inputs
    notes_root: pub Field,
    nullifier_hash: pub Field,
    output1_commitment: pub Field,
    output2_commitment: pub Field
) {
    // 1. Verify input note exists in tree
    let input_commitment = poseidon::bn254::hash_2([input_amount, input_secret]);
    let mut current = input_commitment;
    for i in 0..3 {
        let sibling = input_path[i];
        if input_indices[i] {
            current = poseidon::bn254::hash_2([sibling, current]);
        } else {
            current = poseidon::bn254::hash_2([current, sibling]);
        }
    }
    assert(current == notes_root);

    // 2. Verify nullifier (prevents double-spend)
    let computed_nullifier = poseidon::bn254::hash_2([input_nullifier, input_secret]);
    assert(computed_nullifier == nullifier_hash);

    // 3. Verify amounts balance (input = outputs)
    assert(input_amount == output1_amount + output2_amount);

    // 4. Verify output commitments
    let out1 = poseidon::bn254::hash_2([output1_amount, output1_secret]);
    let out2 = poseidon::bn254::hash_2([output2_amount, output2_secret]);
    assert(out1 == output1_commitment);
    assert(out2 == output2_commitment);
}

// This hides: sender, receiver, and amounts
// Reveals: valid state transition occurred
`,
  sampleInputs: {
    input_amount: '100',
    input_secret: '12345',
    input_nullifier: '67890',
    input_path: ['1', '2', '3'],
    input_indices: [false, true, false],
    output1_amount: '70',
    output1_secret: '11111',
    output2_amount: '30',
    output2_secret: '22222',
    notes_root: '0',
    nullifier_hash: '0',
    output1_commitment: '0',
    output2_commitment: '0',
  },
  tags: ['transfer', 'utxo', 'privacy', 'defi'],
};

// ========================
// GAMES TEMPLATES (2)
// ========================

const sudokuVerifierTemplate: Template = {
  id: 'sudoku-verifier',
  name: 'Sudoku Solution Verifier',
  description: 'Prove you know a valid Sudoku solution without revealing it',
  category: 'games',
  difficulty: 'intermediate',
  code: `// Sudoku Verifier (4x4 simplified version)
// Proves knowledge of a valid Sudoku solution

fn main(
    // Private: the solution (4x4 grid, values 1-4)
    solution: [[Field; 4]; 4],

    // Public: the puzzle (0 = empty cell)
    puzzle: pub [[Field; 4]; 4]
) {
    // 1. Verify solution matches puzzle clues
    for row in 0..4 {
        for col in 0..4 {
            if puzzle[row][col] != 0 {
                assert(solution[row][col] == puzzle[row][col]);
            }
        }
    }

    // 2. Verify all values are 1-4
    for row in 0..4 {
        for col in 0..4 {
            let val = solution[row][col];
            assert(val >= 1);
            assert(val <= 4);
        }
    }

    // 3. Verify rows have unique values
    for row in 0..4 {
        for i in 0..4 {
            for j in (i+1)..4 {
                assert(solution[row][i] != solution[row][j]);
            }
        }
    }

    // 4. Verify columns have unique values
    for col in 0..4 {
        for i in 0..4 {
            for j in (i+1)..4 {
                assert(solution[i][col] != solution[j][col]);
            }
        }
    }

    // 5. Verify 2x2 boxes have unique values
    for box_row in 0..2 {
        for box_col in 0..2 {
            let mut values: [Field; 4] = [0; 4];
            let mut idx = 0;
            for i in 0..2 {
                for j in 0..2 {
                    values[idx] = solution[box_row * 2 + i][box_col * 2 + j];
                    idx += 1;
                }
            }
            // Check uniqueness in box
            for i in 0..4 {
                for j in (i+1)..4 {
                    assert(values[i] != values[j]);
                }
            }
        }
    }
}

// Proves: "I know a valid Sudoku solution"
// Without revealing: the actual solution
`,
  sampleInputs: {
    solution: [
      ['1', '2', '3', '4'],
      ['3', '4', '1', '2'],
      ['2', '1', '4', '3'],
      ['4', '3', '2', '1'],
    ],
    puzzle: [
      ['1', '0', '0', '4'],
      ['0', '4', '1', '0'],
      ['2', '0', '0', '3'],
      ['0', '3', '2', '0'],
    ],
  },
  tags: ['game', 'puzzle', 'sudoku', 'verification'],
};

const battleshipMoveTemplate: Template = {
  id: 'battleship-move',
  name: 'Battleship Move Verification',
  description: 'Verify a Battleship move without revealing ship positions',
  category: 'games',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Battleship Move Verification
// Proves hit/miss without revealing board

fn main(
    // Private: your board setup (1 = ship, 0 = water)
    board: [[Field; 5]; 5],
    board_salt: Field,

    // Public inputs
    board_commitment: pub Field,  // Hash of board setup
    attack_row: pub Field,
    attack_col: pub Field,
    is_hit: pub bool
) {
    // 1. Verify board commitment
    // Flatten board and hash with salt
    let mut board_data: [Field; 26] = [0; 26];
    let mut idx = 0;
    for row in 0..5 {
        for col in 0..5 {
            board_data[idx] = board[row][col];
            idx += 1;
        }
    }
    board_data[25] = board_salt;

    // Simplified: hash first few elements
    let hash1 = poseidon::bn254::hash_2([board_data[0], board_data[1]]);
    let hash2 = poseidon::bn254::hash_2([hash1, board_salt]);
    assert(hash2 == board_commitment);

    // 2. Verify board values are valid (0 or 1)
    for row in 0..5 {
        for col in 0..5 {
            let val = board[row][col];
            assert((val == 0) | (val == 1));
        }
    }

    // 3. Check if attack hits a ship
    let target = board[attack_row][attack_col];
    let hit = target == 1;
    assert(hit == is_hit);
}

// Players commit to board at game start
// Each move is verified without revealing board
`,
  sampleInputs: {
    board: [
      ['1', '1', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '0', '0', '0', '0'],
    ],
    board_salt: '12345',
    board_commitment: '0',
    attack_row: '0',
    attack_col: '0',
    is_hit: 'true',
  },
  tags: ['game', 'battleship', 'strategy', 'commitment'],
};

// ========================
// DEFI TEMPLATES (1)
// ========================

const privateAuctionBidTemplate: Template = {
  id: 'private-auction',
  name: 'Private Auction Bid',
  description: 'Submit a sealed bid that can be revealed and verified later',
  category: 'defi',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Private Auction Bid
// Sealed-bid auction with ZK verification

fn main(
    // Private: actual bid details
    bid_amount: Field,
    bidder_secret: Field,

    // Public inputs
    bid_commitment: pub Field,    // Commitment to bid
    minimum_bid: pub Field,       // Auction minimum
    maximum_bid: pub Field        // Auction maximum (optional cap)
) {
    // 1. Verify bid commitment
    let computed_commitment = poseidon::bn254::hash_2([bid_amount, bidder_secret]);
    assert(computed_commitment == bid_commitment);

    // 2. Verify bid is within valid range
    assert(bid_amount >= minimum_bid);
    assert(bid_amount <= maximum_bid);

    // 3. Additional checks could include:
    // - Proof of funds (Merkle proof of balance)
    // - Timestamp constraints
    // - Bidder eligibility
}

// During auction: only commitment is public
// After auction: winner reveals bid for verification
// Losers can optionally reveal to prove they bid
`,
  sampleInputs: {
    bid_amount: '500',
    bidder_secret: '98765',
    bid_commitment: '0',
    minimum_bid: '100',
    maximum_bid: '1000',
  },
  tags: ['auction', 'sealed-bid', 'defi', 'commitment'],
};

// Additional templates to reach 15+

const passwordVerificationTemplate: Template = {
  id: 'password-verification',
  name: 'Password Verification',
  description: 'Verify a password without revealing it',
  category: 'basic',
  difficulty: 'beginner',
  code: `use std::hash::poseidon;

// Password Verification Circuit
// Proves knowledge of password without revealing it

fn main(
    password: Field,          // Private: the actual password (as field element)
    stored_hash: pub Field    // Public: stored password hash
) {
    // Hash the password
    let password_hash = poseidon::bn254::hash_1([password]);

    // Verify it matches stored hash
    assert(password_hash == stored_hash);
}

// Applications:
// - Authentication without password transmission
// - Zero-knowledge login systems
// - Hardware security modules
`,
  sampleInputs: {
    password: '123456',
    stored_hash: '0',
  },
  tags: ['password', 'authentication', 'security'],
};

const multiplicationProofTemplate: Template = {
  id: 'multiplication-proof',
  name: 'Multiplication Proof',
  description: 'Prove you know two factors of a number',
  category: 'basic',
  difficulty: 'beginner',
  code: `// Multiplication Proof Circuit
// Proves knowledge of factors a and b where a * b = product

fn main(
    factor_a: Field,
    factor_b: Field,
    product: pub Field
) {
    // Verify multiplication
    assert(factor_a * factor_b == product);

    // Optionally verify factors are non-trivial
    assert(factor_a != 1);
    assert(factor_b != 1);
    assert(factor_a != product);
    assert(factor_b != product);
}

// Similar to RSA assumption:
// Proving you know factors without revealing them
`,
  sampleInputs: {
    factor_a: '7',
    factor_b: '13',
    product: '91',
  },
  tags: ['multiplication', 'factoring', 'arithmetic'],
};

const accessControlTemplate: Template = {
  id: 'access-control',
  name: 'Role-Based Access Control',
  description: 'Prove you have a specific role/permission without revealing identity',
  category: 'privacy',
  difficulty: 'intermediate',
  code: `use std::hash::poseidon;

// Role-Based Access Control
// Proves user has required role without revealing identity

fn main(
    // Private: user credentials
    user_id: Field,
    user_secret: Field,
    role_id: Field,

    // Private: Merkle proof of role assignment
    role_path: [Field; 3],
    role_indices: [bool; 3],

    // Public inputs
    required_role: pub Field,        // Role needed for access
    roles_root: pub Field            // Merkle root of role assignments
) {
    // 1. Verify user has the required role
    assert(role_id == required_role);

    // 2. Compute role assignment leaf
    let assignment = poseidon::bn254::hash_2([user_id, role_id]);
    let leaf = poseidon::bn254::hash_2([assignment, user_secret]);

    // 3. Verify Merkle membership
    let mut current = leaf;
    for i in 0..3 {
        let sibling = role_path[i];
        if role_indices[i] {
            current = poseidon::bn254::hash_2([sibling, current]);
        } else {
            current = poseidon::bn254::hash_2([current, sibling]);
        }
    }
    assert(current == roles_root);
}

// Proves: "I have role X"
// Without revealing: who I am
`,
  sampleInputs: {
    user_id: '12345',
    user_secret: '67890',
    role_id: '1',
    role_path: ['1', '2', '3'],
    role_indices: [false, true, false],
    required_role: '1',
    roles_root: '0',
  },
  tags: ['access', 'rbac', 'permissions', 'identity'],
};

// Export all templates
export const templates: Template[] = [
  // Basic (6)
  helloWorldTemplate,
  ageVerificationTemplate,
  rangeProofTemplate,
  equalityCheckTemplate,
  hashPreimageTemplate,
  passwordVerificationTemplate,
  multiplicationProofTemplate,

  // Cryptography (4)
  ecdsaVerificationTemplate,
  schnorrSignatureTemplate,
  hashChainTemplate,
  commitmentSchemeTemplate,

  // Privacy (4)
  merkleTreeMembershipTemplate,
  anonymousVotingTemplate,
  privateTransferTemplate,
  accessControlTemplate,

  // Games (2)
  sudokuVerifierTemplate,
  battleshipMoveTemplate,

  // DeFi (1)
  privateAuctionBidTemplate,
];

// Helper functions
export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter(t => t.category === category);
}

export function getTemplatesByDifficulty(difficulty: Template['difficulty']): Template[] {
  return templates.filter(t => t.difficulty === difficulty);
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return templates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateCategories(): Template['category'][] {
  return ['basic', 'cryptography', 'privacy', 'games', 'defi'];
}

export function getDifficultyLevels(): Template['difficulty'][] {
  return ['beginner', 'intermediate', 'advanced'];
}

export default templates;
