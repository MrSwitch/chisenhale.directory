import { Liquid } from "liquidjs";
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addShortcode("obfusicate", (content) => {
    return `<script>document.write('${content.split('').join(`'+'`)}');</script>`;
  });
}
