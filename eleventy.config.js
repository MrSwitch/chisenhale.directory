export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.ignores.add("README.md");

  eleventyConfig.addShortcode("obfusicate", (content) => {
    return `<script>document.write('${content.split('').join(`'+'`)}');</script>`;
  });
}
