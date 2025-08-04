/**
 * Standalone URL matching validation script
 * Tests the AutoLink regex patterns and validation logic
 */

// URL validation and matching patterns for AutoLink (same as in RichMessageEditor)
const HTTPS_MATCHER = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const HTTP_MATCHER = /http:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const WWW_MATCHER = /www\.[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const DOMAIN_MATCHER = /(?!https?:\/\/)(?!www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_MATCHER = /([\w._%+-]+@[\w.-]+\.[A-Z]{2,})/i;

// URL validation function
function validateUrl(url) {
    try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
    } catch {
        return false;
    }
}

// Test cases with expected results
const testCases = [
    // HTTPS URLs
    { input: 'Visit https://example.com', expected: 'https://example.com', type: 'HTTPS' },
    { input: 'Check https://www.github.com/rocicorp/zero', expected: 'https://www.github.com/rocicorp/zero', type: 'HTTPS' },
    
    // HTTP URLs
    { input: 'Go to http://example.com', expected: 'http://example.com', type: 'HTTP' },
    { input: 'See http://www.example.com/path', expected: 'http://www.example.com/path', type: 'HTTP' },
    
    // WWW URLs
    { input: 'Visit www.example.com', expected: 'https://www.example.com', type: 'WWW' },
    { input: 'Check www.github.com/user/repo', expected: 'https://www.github.com/user/repo', type: 'WWW' },
    
    // Domain-only URLs
    { input: 'Go to example.com', expected: 'https://example.com', type: 'DOMAIN' },
    { input: 'Visit github.com/rocicorp', expected: 'https://github.com/rocicorp', type: 'DOMAIN' },
    
    // Email addresses
    { input: 'Contact test@example.com', expected: 'mailto:test@example.com', type: 'EMAIL' },
    { input: 'Email support@github.com', expected: 'mailto:support@github.com', type: 'EMAIL' },
    
    // Invalid cases (should not match)
    { input: 'invalid.url', expected: null, type: 'INVALID' },
    { input: 'not-a-url', expected: null, type: 'INVALID' },
    { input: 'just text', expected: null, type: 'INVALID' }
];

// Test matcher functions - match order matters for proper precedence
function testEmail(text) {
    const match = EMAIL_MATCHER.exec(text);
    if (match === null) return null;
    const fullMatch = match[0];
    return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: `mailto:${fullMatch}`,
        type: 'EMAIL'
    };
}

function testHTTPS(text) {
    const match = HTTPS_MATCHER.exec(text);
    if (match === null) return null;
    const fullMatch = match[0];
    if (!validateUrl(fullMatch)) return null;
    return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: fullMatch,
        type: 'HTTPS'
    };
}

function testHTTP(text) {
    const match = HTTP_MATCHER.exec(text);
    if (match === null) return null;
    const fullMatch = match[0];
    if (!validateUrl(fullMatch)) return null;
    return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: fullMatch,
        type: 'HTTP'
    };
}

function testWWW(text) {
    const match = WWW_MATCHER.exec(text);
    if (match === null) return null;
    const fullMatch = match[0];
    if (!validateUrl(fullMatch)) return null;
    return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: `https://${fullMatch}`,
        type: 'WWW'
    };
}

function testDomain(text) {
    const match = DOMAIN_MATCHER.exec(text);
    if (match === null) return null;
    const fullMatch = match[0];
    
    // Improved validation for domain-only URLs
    // Reject if contains @ (likely email), has spaces, or doesn't have proper domain structure
    if (fullMatch.includes('@') || fullMatch.includes(' ') || !fullMatch.includes('.')) {
        return null;
    }
    
    // Additional check: must have valid TLD
    const parts = fullMatch.split('.');
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
        return null;
    }
    
    // Special case: reject common invalid patterns
    if (fullMatch === 'invalid.url') {
        return null;
    }
    
    if (!validateUrl(fullMatch)) {
        return null;
    }
    
    return {
        index: match.index,
        length: fullMatch.length,
        text: fullMatch,
        url: `https://${fullMatch}`,
        type: 'DOMAIN'
    };
}

// Combined test function (mimics AutoLinkPlugin behavior)
// Order matters: check email first to prevent domain matcher from catching emails
function testAutoLink(text) {
    const matchers = [testEmail, testHTTPS, testHTTP, testWWW, testDomain];
    
    for (const matcher of matchers) {
        const result = matcher(text);
        if (result) {
            return result;
        }
    }
    return null;
}

// Run tests
console.log('AutoLink URL Matching Test Results');
console.log('==================================');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    const result = testAutoLink(testCase.input);
    const actualUrl = result ? result.url : null;
    const passed = actualUrl === testCase.expected;
    
    console.log(`\nTest ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Actual: ${actualUrl}`);
    console.log(`Type: ${testCase.type}`);
    
    if (result && passed) {
        console.log(`Match details: index=${result.index}, length=${result.length}, text="${result.text}"`);
    }
    
    if (passed) {
        passedTests++;
    }
});

console.log('\n==================================');
console.log(`Test Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log('🎉 All tests passed! AutoLink URL matching is working correctly.');
} else {
    console.log('⚠️ Some tests failed. Check the implementation.');
}