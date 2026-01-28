import type { TestCase, Challenge } from '@/types';
import type { TestResult } from '@/stores/tutorialStore';

export interface TestRunnerConfig {
  code: string;
  challenge: Challenge;
  onProgress?: (current: number, total: number) => void;
}

export interface TestRunnerResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

// Simulated compilation and proof generation for tutorials
// In production, this would use the real Noir compiler
async function simulateCircuitExecution(
  code: string,
  inputs: Record<string, unknown>,
  shouldPass: boolean
): Promise<{ success: boolean; error?: string }> {
  // Simulate compilation time
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Basic code validation
  if (!code.includes('fn main')) {
    return { success: false, error: 'Missing main function' };
  }

  if (!code.includes('assert')) {
    return { success: false, error: 'No assert statements found' };
  }

  // Check for common patterns
  const hasValidStructure =
    code.includes('fn main(') &&
    code.includes(')') &&
    code.includes('{') &&
    code.includes('}');

  if (!hasValidStructure) {
    return { success: false, error: 'Invalid circuit structure' };
  }

  // For tutorial purposes, we simulate based on expected outcome
  // This allows students to see pass/fail without full compilation
  if (shouldPass) {
    // Check if the code looks correct for passing cases
    const hasAssert = code.includes('assert(');
    const hasOperation = code.includes('==') || code.includes('>=') || code.includes('<=');

    if (hasAssert && hasOperation) {
      return { success: true };
    } else {
      return { success: false, error: 'Circuit constraints may be incomplete' };
    }
  } else {
    // For cases that should fail, we return success if the circuit
    // would correctly reject the invalid input
    return { success: true }; // The circuit "correctly" rejects invalid input
  }
}

export async function runTests(config: TestRunnerConfig): Promise<TestRunnerResult> {
  const { code, challenge, onProgress } = config;
  const results: TestResult[] = [];
  let passedCount = 0;

  for (let i = 0; i < challenge.testCases.length; i++) {
    const testCase = challenge.testCases[i];
    onProgress?.(i + 1, challenge.testCases.length);

    try {
      const result = await simulateCircuitExecution(
        code,
        testCase.inputs,
        testCase.shouldPass
      );

      const passed = testCase.shouldPass ? result.success : !result.success;

      results.push({
        testCase: `Test ${i + 1}`,
        description: testCase.description,
        passed,
        error: passed ? undefined : result.error || 'Test failed',
        inputs: testCase.inputs,
        expectedPass: testCase.shouldPass,
      });

      if (passed) {
        passedCount++;
      }
    } catch (error) {
      results.push({
        testCase: `Test ${i + 1}`,
        description: testCase.description,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        inputs: testCase.inputs,
        expectedPass: testCase.shouldPass,
      });
    }
  }

  return {
    passed: passedCount === challenge.testCases.length,
    totalTests: challenge.testCases.length,
    passedTests: passedCount,
    failedTests: challenge.testCases.length - passedCount,
    results,
  };
}

// Validate code against requirements
export function validateRequirements(
  code: string,
  requirements: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const requirement of requirements) {
    const reqLower = requirement.toLowerCase();

    // Check for common requirement patterns
    if (reqLower.includes('assert') && !code.includes('assert(')) {
      missing.push(requirement);
    } else if (reqLower.includes('hash') && !code.includes('hash')) {
      missing.push(requirement);
    } else if (reqLower.includes('poseidon') && !code.includes('poseidon')) {
      missing.push(requirement);
    } else if (reqLower.includes('merkle') && !code.includes('merkle')) {
      missing.push(requirement);
    } else if (reqLower.includes('pub ') && !code.includes('pub ')) {
      missing.push(requirement);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Check if solution matches expected pattern
export function checkSolutionSimilarity(
  userCode: string,
  solution: string
): { similarity: number; feedback: string } {
  // Normalize code for comparison
  const normalizeCode = (code: string) =>
    code
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();

  const normalizedUser = normalizeCode(userCode);
  const normalizedSolution = normalizeCode(solution);

  // Calculate simple similarity
  const userTokens = new Set(normalizedUser.split(' '));
  const solutionTokens = new Set(normalizedSolution.split(' '));

  const intersection = new Set(
    [...userTokens].filter((x) => solutionTokens.has(x))
  );

  const similarity =
    intersection.size / Math.max(userTokens.size, solutionTokens.size);

  // Generate feedback
  let feedback = '';
  if (similarity >= 0.9) {
    feedback = 'Excellent! Your solution closely matches the expected approach.';
  } else if (similarity >= 0.7) {
    feedback = 'Good job! Your solution is on the right track.';
  } else if (similarity >= 0.5) {
    feedback = 'You\'re making progress. Consider reviewing the hints.';
  } else {
    feedback = 'Your approach differs significantly from the expected solution. Try using the hints or reviewing the lesson content.';
  }

  return { similarity, feedback };
}

export default runTests;
