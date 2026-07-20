import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import Image from "@11ty/eleventy-img";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssMediaMinmax from 'postcss-media-minmax';
import postcssNested from 'postcss-nested';
import postcssCssVariables from 'postcss-css-variables';
import postcssLightDarkFunction from '@csstools/postcss-light-dark-function';


export default function (eleventyConfig) {
  const assetVersionCache = new Map();

  eleventyConfig.addFilter("asset", async (assetPath) => {
    if (!assetPath || assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
      return assetPath;
    }

    if (assetVersionCache.has(assetPath)) {
      return assetVersionCache.get(assetPath);
    }

    const cleanPath = assetPath.split("?")[0];
    const relativePath = cleanPath.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), relativePath);

    try {
      const fileContent = await fs.readFile(fullPath);
      const hash = crypto.createHash("sha256").update(fileContent).digest("hex").slice(0, 10);
      const versionedPath = `${assetPath}?v=${hash}`;
      assetVersionCache.set(assetPath, versionedPath);
      return versionedPath;
    } catch {
      return assetPath;
    }
  });

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		widths: [400, 800, 1800, "auto"],
    formats: ["avif", "webp"],
    // Set global sizes attribute for responsive scaling
    defaultAttributes: {
      sizes: "(max-width: 1200px) 100vw, 1200px",
      loading: "lazy",
      decoding: "async",
    },
  });
  eleventyConfig.addShortcode("ogImage", async function(src) {
    if (!src || src.startsWith('http')) {
      return src || '';
    }
    let metadata = await Image(`.${src}`, {
      widths: [1200],
      formats: ["webp"],
      outputDir: "./_site/img/",
      urlPath: "https://chisenhale.directory/img/",
      sharpOptions: {
        resize: {
          width: 1200,
          height: 630,
          fit: "cover",
        },
      },
    });
    return metadata.webp[0].url;
  });

  eleventyConfig.addFilter("absolute_url", (url) => {
    console.log("Generating absolute URL for", url);
    return new URL(url || "/", "https://chisenhale.directory").href;
  });

  eleventyConfig.addTemplateFormats('css');
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.ignores.add("README.md");

  eleventyConfig.addShortcode("obfuscate", (content) => {
    const encoded = Buffer.from([...content].reverse().join("")).toString("base64");
    return `<obfuscated-text data="${encoded}"></obfuscated-text>`;
  });

  eleventyConfig.addExtension('css', {
    outputFileExtension: 'css',
    async compile(content, path) {
      // Processing only process style.css
      if (path !== './style.css') {
        return;
      }
      return async () => {
        let output = await postcss([
          postcssImport,
          postcssNested,
          postcssCssVariables,
          postcssMediaMinmax,
          postcssLightDarkFunction,
        ]).process(content, {
          from: path,
        });

        return output.css;
      }
    }
});
}
