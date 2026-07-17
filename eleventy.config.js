import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import Image from "@11ty/eleventy-img";
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssMediaMinmax from 'postcss-media-minmax';
import postcssNested from 'postcss-nested';
import postcssCssVariables from 'postcss-css-variables';
import postcssLightDarkFunction from '@csstools/postcss-light-dark-function';


export default function (eleventyConfig) {
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
    return `<script>document.write('${content.split('').join(`'+'`)}');</script>`;
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
