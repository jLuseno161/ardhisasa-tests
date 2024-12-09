const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://192.168.214.39:8000/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // retries:3
  },
});
