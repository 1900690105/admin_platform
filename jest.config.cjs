module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.js$": "babel-jest",
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/", // 👈 important
  ],
};
