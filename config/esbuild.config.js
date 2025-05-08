const path = require("path");

module.exports = {
  entryPoints: ["app/javascript/application.js"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
