const { convertToMinutes, convertTo12Hour } = require('./src/utils/timeUtils');

console.log('Testing timeUtils.js...');

const testCases = [
    { input: '09:00 AM', expected: 540 },
    { input: '12:00 PM', expected: 720 },
    { input: '12:30 PM', expected: 750 },
    { input: '01:00 PM', expected: 780 },
    { input: '11:59 PM', expected: 1439 },
    { input: '12:00 AM', expected: 0 },
    { input: '12:30 AM', expected: 30 }
];

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected }) => {
    const result = convertToMinutes(input);
    if (result === expected) {
        console.log(`✅ convertToMinutes('${input}') = ${result}`);
        passed++;
    } else {
        console.error(`❌ convertToMinutes('${input}') = ${result}, expected ${expected}`);
        failed++;
    }
});

const reverseTestCases = [
    { input: 540, expected: '9:00 AM' },
    { input: 720, expected: '12:00 PM' },
    { input: 750, expected: '12:30 PM' },
    { input: 780, expected: '1:00 PM' },
    { input: 0, expected: '12:00 AM' },
    { input: 30, expected: '12:30 AM' }
];

reverseTestCases.forEach(({ input, expected }) => {
    const result = convertTo12Hour(input);
    if (result === expected) {
        console.log(`✅ convertTo12Hour(${input}) = '${result}'`);
        passed++;
    } else {
        console.error(`❌ convertTo12Hour(${input}) = '${result}', expected '${expected}'`);
        failed++;
    }
});

if (failed === 0) {
    console.log(`\n🎉 All ${passed} tests passed!`);
} else {
    console.error(`\n💥 ${failed} tests failed.`);
    process.exit(1);
}
