const fs = require("fs-extra");
const path = require("path");

try {
  fs.copySync(
    path.resolve(__dirname, "..", "dist"),
    path.resolve(__dirname, "..")
  );
  fs.removeSync(path.resolve(__dirname, "..", "dist"));
} catch (err) {
  console.error("Failed to move files to the root folder", err);
}
