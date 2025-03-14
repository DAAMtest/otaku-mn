// Apply graceful-fs patch to handle EMFILE errors
try {
  const fs = require("fs");
  const gracefulFs = require("graceful-fs");

  // Patch the fs module to handle EMFILE errors
  gracefulFs.gracefulify(fs);

  // Increase the event emitter limit for the current process
  const events = require("events");
  events.defaultMaxListeners = 100;

  console.log("Successfully applied graceful-fs patch");
} catch (error) {
  console.warn("Failed to apply graceful-fs patch:", error);
}
