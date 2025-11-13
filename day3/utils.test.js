const utils = require('./utils');

const MOCK_DATE = new Date('2025-01-01T10:00:00.000Z');
const originalDate = global.Date;

beforeAll(() => {
  global.Date = jest.fn(() => MOCK_DATE);
  global.Date.toISOString = originalDate.toISOString;
  global.Date.now = originalDate.now;
});

afterAll(() => {
  global.Date = originalDate;
});

describe('1. Exact Equality Matchers (toBe, toEqual, toStrictEqual)', () => {
  describe('toBe', () => {
    test('sum(2, 2) should be 4', () => {
      expect(utils.sum(2, 2)).toBe(4);
    });

    test('sum(1, 2) should NOT be 4', () => {
      expect(utils.sum(1, 2)).not.toBe(4);
    });
  });

  describe('toEqual', () => {
    const expectedUser = {
      name: 'Alice',
      age: 30,
      createdAt: MOCK_DATE,
    };

    test('createUser("Alice", 30) should return an object equal to expectedUser', () => {
      expect(utils.createUser('Alice', 30)).toEqual(expectedUser);
    });

    test('createUser("Bob", 25) should NOT equal Alice', () => {
      expect(utils.createUser('Bob', 25)).not.toEqual(expectedUser);
    });
  });

  describe('toStrictEqual', () => {
    const obj1 = { a: 1, b: undefined };
    const obj2 = { a: 1 };

    test('Object with explicit undefined property should strictly equal itself', () => {
      expect(obj1).toStrictEqual({ a: 1, b: undefined });
    });

    test('Object with undefined property should NOT strictly equal one without it', () => {
      expect(obj1).not.toStrictEqual(obj2);
    });
  });
});

describe('2. Negation (.not)', () => {
  test('.not.toBeNull should pass for a defined value', () => {
    expect(utils.sum(1, 1)).not.toBeNull();
  });

  test('.not.toBeNull should fail for a null value', () => {
    expect(null).toBeNull();
  });

  test('.not.toContain should pass if a value is absent', () => {
    expect([1, 2, 3]).not.toContain(5);
  });
});

describe('3. Truthiness Matchers', () => {
  test('toBeNull should pass for a null value', () => {
    expect(null).toBeNull();
  });

  test('toBeUndefined should pass for a function that implicitly returns undefined', () => {
    const result = (function () {})();
    expect(result).toBeUndefined();
  });

  test('toBeDefined should pass for any defined result (including null)', () => {
    expect(utils.sum(1, 1)).toBeDefined();
  });

  test('toBeTruthy should pass for a truthy result', () => {
    expect(utils.findInArray([1, 2, 3], 2)).toBeTruthy();
  });

  test('toBeFalsy should pass for a falsy result', () => {
    expect(utils.findInArray([1, 2, 3], 4)).toBeFalsy();
  });

  test('findInArray should NOT be truthy if value is absent (failing)', () => {
    expect(utils.findInArray([1, 2, 3], 4)).not.toBeTruthy();
  });
});

describe('4. Number Matchers', () => {
  test('sum(2, 3) should be greater than 4', () => {
    expect(utils.sum(2, 3)).toBeGreaterThan(4);
  });

  test('sum(1, 1) should NOT be greater than 4', () => {
    expect(utils.sum(1, 1)).not.toBeGreaterThan(4);
  });

  test('approximateDivision(10, 2) should be less than or equal to 5', () => {
    expect(utils.approximateDivision(10, 2)).toBeLessThanOrEqual(5);
  });

  test('sum(5, 5) should NOT be less than 5', () => {
    expect(utils.sum(5, 5)).not.toBeLessThan(5);
  });

  test('approximateDivision(0.3, 0.1) should be close to 3', () => {
    expect(utils.approximateDivision(0.3, 0.1)).toBeCloseTo(3);
    expect(utils.approximateDivision(0.3, 0.1)).toBeCloseTo(3, 10);
  });

  test('approximateDivision(0.3, 0.1) should NOT be strictly equal to 3', () => {
    expect(utils.approximateDivision(0.3, 0.1)).not.toBe(3);
  });
});

describe('5. String Matchers (toMatch)', () => {
  test('User name "Charlie" should match the regex /Cha/', () => {
    expect('Charlie').toMatch(/Cha/);
  });

  test('JSON string should NOT match "secret"', () => {
    const jsonString = JSON.stringify(utils.createUser('Eve', 22));
    expect(jsonString).not.toMatch(/secret/);
  });

  test('User name "Frank" should NOT match the regex /Zelda/', () => {
    expect('Frank').not.toMatch(/Zelda/);
  });
});

describe('6. Arrays/Iterables Matchers (toContain)', () => {
  const users = [
    { name: 'Adam', age: 25 },
    { name: 'Kid', age: 10 },
  ];

  test('filterAdults array should contain Adam', () => {
    const adults = utils.filterAdults(users);
    expect(adults).toContainEqual({ name: 'Adam', age: 25 });
  });

  test('filterAdults array should NOT contain Kid', () => {
    const adults = utils.filterAdults(users);
    expect(adults).not.toContainEqual({ name: 'Kid', age: 10 });
  });

  test('Adults array should NOT contain the 10 year old', () => {
    const adults = utils.filterAdults(users);
    expect(adults).not.toContainEqual({ name: 'Kid', age: 10 });
  });

  test('A Set should contain the value 4', () => {
    const numSet = new Set([1, 2, 3, 4]);
    expect(numSet).toContain(4);
  });
});

describe('7. Exception Matchers (toThrow)', () => {
  test('parseJSON() with invalid JSON should throw an error', () => {
    expect(() => utils.parseJSON('invalid json')).toThrow();
  });

  test('parseJSON() with null string should throw "No JSON string provided"', () => {
    expect(() => utils.parseJSON(null)).toThrow('No JSON string provided');
    expect(() => utils.parseJSON(null)).toThrow(Error);
  });

  test('parseJSON() with valid JSON should NOT throw', () => {
    expect(() => utils.parseJSON('{"key": "value"}')).not.toThrow();
  });
});
