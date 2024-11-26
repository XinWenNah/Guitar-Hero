// Utility functions and definitions.
// Nothing here is specific to asteroids.
// Everything is designed to be as reusable as possible in many different contexts.
export {attr, isNotNullOrUndefined, RNG }

//Code adopted from Week 4 workshop
/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed 
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

    /**
    * Takes hash value and scales it to the range [-1, 1]
     */
    public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;

    /**
     * Takes hash value and scales it to range [min, max]
     */
    public static random = (hashingValue: number, min: number, max: number) => {
        //Scale it to range [-1,1]
        const scaledNumber = RNG.scale(hashingValue)

        //Change the range to [0, 1]
        const normalRandom = (scaledNumber+1)/2

        return normalRandom*(max-min) + min;
    }
    
}

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
  const  attr = (e: Element, o: { [p: string]: unknown }) => { 
        for (const k in o) e.setAttribute(k, String(o[k])) }
/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
function isNotNullOrUndefined<T extends object>(input: null | undefined | T): 
input is T {
    return input != null;
}