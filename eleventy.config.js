import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssMediaMinmax from 'postcss-media-minmax';
import postcssNested from 'postcss-nested';

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		widths: ["1800"],
    formats: ["webp"],
  });
  eleventyConfig.addTemplateFormats('css');
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.ignores.add("README.md");

  eleventyConfig.addShortcode("obfusicate", (content) => {
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
          postcssMediaMinmax,
        ]).process(content, {
          from: path,
        });

        return output.css;
      }
    }
});
}
