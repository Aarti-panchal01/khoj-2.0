/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * This test is designed to FAIL on unfixed code to demonstrate the bug exists.
 * 
 * Property 1: Bug Condition - Mobile Dropdown Displays Universities and DSI Campus Data Correction
 * 
 * The test verifies two bug conditions:
 * 1. DSI campus data contains DSIT (4 campuses instead of 3)
 * 2. Mobile dropdown rendering issue (simulated through data validation)
 * 
 * EXPECTED OUTCOME ON UNFIXED CODE: TEST FAILS
 * - DSI will have 4 campuses including DSIT
 * - This confirms the bug exists
 * 
 * EXPECTED OUTCOME ON FIXED CODE: TEST PASSES
 * - DSI will have exactly 3 campuses (DSU, DSCE, DSATM)
 * - Mobile dropdown will render correctly
 */

const fc = require('fast-check');
const universities = require('../data/universities');

describe('Bug Condition Exploration - Mobile Dropdown and DSI Campus Data', () => {
  
  describe('DSI Campus Data Bug', () => {
    test('DSI should have exactly 3 campuses without DSIT', () => {
      // Find Dayananda Sagar Institutions
      const dsi = universities.find(u => u.name === 'Dayananda Sagar Institutions');
      
      // Verify DSI exists
      expect(dsi).toBeDefined();
      expect(dsi).not.toBeNull();
      
      // BUG CONDITION: DSI currently has 4 campuses including DSIT
      // EXPECTED BEHAVIOR: DSI should have exactly 3 campuses
      expect(dsi.campuses).toHaveLength(3);
      
      // Verify the correct campuses exist
      const campusNames = dsi.campuses.map(c => c.name);
      expect(campusNames).toContain('DSU');
      expect(campusNames).toContain('DSCE');
      expect(campusNames).toContain('DSATM');
      
      // BUG CONDITION: DSIT should NOT exist
      expect(campusNames).not.toContain('DSIT');
    });
    
    test('Property: DSI campus count is exactly 3 for any query', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...universities),
          (university) => {
            // Only test DSI
            if (university.name !== 'Dayananda Sagar Institutions') {
              return true; // Skip other universities
            }
            
            // EXPECTED BEHAVIOR: DSI should have exactly 3 campuses
            return university.campuses.length === 3;
          }
        ),
        { verbose: true }
      );
    });
  });
  
  describe('University Data Structure Validation', () => {
    test('All universities should have valid structure', () => {
      expect(universities).toBeDefined();
      expect(Array.isArray(universities)).toBe(true);
      expect(universities.length).toBe(5);
      
      universities.forEach(university => {
        expect(university).toHaveProperty('name');
        expect(university).toHaveProperty('slug');
        expect(university).toHaveProperty('campuses');
        expect(Array.isArray(university.campuses)).toBe(true);
        expect(university.campuses.length).toBeGreaterThan(0);
      });
    });
    
    test('Property: All universities have at least one campus', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...universities),
          (university) => {
            return university.campuses.length >= 1;
          }
        )
      );
    });
  });
  
  describe('Mobile Dropdown Data Validation', () => {
    test('Universities array should be suitable for dropdown rendering', () => {
      // Simulate the transformation done in Login.jsx and Signup.jsx
      // const options = universities.map(u => ({ value: u.name, label: u.name }))
      
      const options = universities.map(u => ({ 
        value: u.name, 
        label: u.name 
      }));
      
      // Verify options array is properly formed
      expect(options).toHaveLength(5);
      
      // Verify each option has value and label
      options.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
        expect(option.value.length).toBeGreaterThan(0);
        expect(option.label.length).toBeGreaterThan(0);
      });
      
      // Verify all universities are represented
      const universityNames = universities.map(u => u.name);
      const optionValues = options.map(o => o.value);
      expect(optionValues).toEqual(universityNames);
    });
    
    test('Property: University data transforms correctly to dropdown options', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...universities),
          (university) => {
            const option = { value: university.name, label: university.name };
            
            // Verify transformation produces valid option
            return (
              typeof option.value === 'string' &&
              typeof option.label === 'string' &&
              option.value.length > 0 &&
              option.label.length > 0 &&
              option.value === university.name
            );
          }
        )
      );
    });
  });
  
  describe('Bug Condition: DSI Campus Data Counterexamples', () => {
    test('Document counterexample: DSI has 4 campuses on unfixed code', () => {
      const dsi = universities.find(u => u.name === 'Dayananda Sagar Institutions');
      
      // This test documents the current buggy state
      // On UNFIXED code: campuses.length will be 4
      // On FIXED code: campuses.length will be 3
      
      const actualCampusCount = dsi.campuses.length;
      const campusNames = dsi.campuses.map(c => c.name);
      
      console.log('=== BUG CONDITION COUNTEREXAMPLE ===');
      console.log(`DSI Campus Count: ${actualCampusCount}`);
      console.log(`DSI Campuses: ${campusNames.join(', ')}`);
      console.log(`Contains DSIT: ${campusNames.includes('DSIT')}`);
      console.log('===================================');
      
      // This assertion will FAIL on unfixed code (proving bug exists)
      // and PASS on fixed code (proving bug is fixed)
      expect(actualCampusCount).toBe(3);
      expect(campusNames).not.toContain('DSIT');
    });
  });
});
