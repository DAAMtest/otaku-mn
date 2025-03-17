module.exports = {
  styles: {
    // Path to your tailwind.css file
    source: "./tailwind.css",
    // Options for postcss
    options: {
      // Additional PostCSS plugins if needed
      postcssPlugins: [],
    },
  },
  // Experimental features for better integration and performance
  experimental: {
    // Optimize styles from 'shadcn-ui' (if you use it)
    optimizeLibraries: ["shadcn-ui"],
  },
};
