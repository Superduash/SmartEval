const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/out/"],
  watchPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/out/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
