export default {
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["<rootDir>/test/**"],
  testPathIgnorePatterns: ["/node_modules/"],
  coverageDirectory: "./coverage",
  coveragePathIgnorePatterns: ["node_modules", "src/test"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFiles: ["dotenv/config"],
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest/presets/js-with-ts",

  transformIgnorePatterns: [
    "node_modules/(?!(module-that-needs-to-be-transformed)/)",
  ],
};
