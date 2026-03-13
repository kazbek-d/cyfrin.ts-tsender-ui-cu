import { calculateTotal } from './calculateTotal';
import { describe, it, expect } from "vitest"


describe('calculateTotal', () => {

    it('should sum numbers separated by commas', () => {
        expect(calculateTotal("100,200,300")).toBe(600);
    });

    it('should handle different delimiters (newlines, semicolons, spaces)', () => {
        expect(calculateTotal("100\n200;300 400")).toBe(1000);
    });

    it('should ignore multiple consecutive delimiters', () => {
        // Testing the regex [ , \n ; ]+ logic
        expect(calculateTotal("100,,,  \n\n 200")).toBe(300);
    });

    it('should handle decimal numbers correctly', () => {
        expect(calculateTotal("10.5, 20.5, 5")).toBe(36);
    });

    it('should return 0 for empty or whitespace-only strings', () => {
        expect(calculateTotal("")).toBe(0);
        expect(calculateTotal("   ")).toBe(0);
    });

    it('should ignore non-numeric garbage in the string', () => {
        // "abc" will be NaN and filtered out
        expect(calculateTotal("100, abc, 200")).toBe(300);
    });

    it('should handle trailing or leading delimiters', () => {
        expect(calculateTotal(",100,200,")).toBe(300);
    });

});