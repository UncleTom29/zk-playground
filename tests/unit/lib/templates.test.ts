import {
  templates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getTemplateCategories,
  getDifficultyLevels,
} from '@/lib/templates/templateData';

describe('Template Data', () => {
  describe('templates array', () => {
    it('should have at least 15 templates', () => {
      expect(templates.length).toBeGreaterThanOrEqual(15);
    });

    it('should have all required properties for each template', () => {
      templates.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.difficulty).toBeDefined();
        expect(template.code).toBeDefined();
        expect(template.sampleInputs).toBeDefined();
        expect(template.tags).toBeDefined();
        expect(Array.isArray(template.tags)).toBe(true);
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['basic', 'cryptography', 'privacy', 'games', 'defi'];
      templates.forEach((template) => {
        expect(validCategories).toContain(template.category);
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      templates.forEach((template) => {
        expect(validDifficulties).toContain(template.difficulty);
      });
    });

    it('should have unique IDs', () => {
      const ids = templates.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getTemplateById', () => {
    it('should return template when found', () => {
      const template = getTemplateById('hello-world');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Hello World');
    });

    it('should return undefined when not found', () => {
      const template = getTemplateById('nonexistent');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates filtered by category', () => {
      const basicTemplates = getTemplatesByCategory('basic');
      expect(basicTemplates.length).toBeGreaterThan(0);
      basicTemplates.forEach((t) => {
        expect(t.category).toBe('basic');
      });
    });

    it('should return cryptography templates', () => {
      const cryptoTemplates = getTemplatesByCategory('cryptography');
      expect(cryptoTemplates.length).toBeGreaterThan(0);
    });

    it('should return privacy templates', () => {
      const privacyTemplates = getTemplatesByCategory('privacy');
      expect(privacyTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('getTemplatesByDifficulty', () => {
    it('should return templates filtered by difficulty', () => {
      const beginnerTemplates = getTemplatesByDifficulty('beginner');
      expect(beginnerTemplates.length).toBeGreaterThan(0);
      beginnerTemplates.forEach((t) => {
        expect(t.difficulty).toBe('beginner');
      });
    });

    it('should return intermediate templates', () => {
      const intermediateTemplates = getTemplatesByDifficulty('intermediate');
      expect(intermediateTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('searchTemplates', () => {
    it('should search by name', () => {
      const results = searchTemplates('Hello World');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.name.includes('Hello World'))).toBe(true);
    });

    it('should search by description', () => {
      const results = searchTemplates('prove');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by tags', () => {
      const results = searchTemplates('merkle');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const results1 = searchTemplates('MERKLE');
      const results2 = searchTemplates('merkle');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchTemplates('xyznonexistent123');
      expect(results.length).toBe(0);
    });
  });

  describe('getTemplateCategories', () => {
    it('should return all valid categories', () => {
      const categories = getTemplateCategories();
      expect(categories).toContain('basic');
      expect(categories).toContain('cryptography');
      expect(categories).toContain('privacy');
      expect(categories).toContain('games');
      expect(categories).toContain('defi');
    });
  });

  describe('getDifficultyLevels', () => {
    it('should return all valid difficulty levels', () => {
      const levels = getDifficultyLevels();
      expect(levels).toContain('beginner');
      expect(levels).toContain('intermediate');
      expect(levels).toContain('advanced');
    });
  });
});

describe('Template Code Quality', () => {
  it('all templates should have valid Noir function structure', () => {
    templates.forEach((template) => {
      expect(template.code).toContain('fn main');
      expect(template.code).toContain('(');
      expect(template.code).toContain(')');
      expect(template.code).toContain('{');
      expect(template.code).toContain('}');
    });
  });

  it('templates with hash functions should import std::hash', () => {
    const hashTemplates = templates.filter(
      (t) => t.code.includes('poseidon') || t.code.includes('pedersen')
    );

    hashTemplates.forEach((template) => {
      expect(template.code).toContain('use std::hash');
    });
  });

  it('templates should have meaningful sample inputs', () => {
    templates.forEach((template) => {
      const inputKeys = Object.keys(template.sampleInputs);
      expect(inputKeys.length).toBeGreaterThan(0);
    });
  });
});
