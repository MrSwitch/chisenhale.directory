# Readme

Hello, welcome to the code base for [//chisenhale.directory](https://chisenhale.directory) website.

> [!CAUTION]
> First things first: Any changes made to the `main` branch will trigger a rebuild and all being well will deploy straight to the website, warts and all!


# 🧾 Overview

Here's the rough file structure...

```
.
├── .github/workflows/    # ⚠️🔥 Controls publishing the website
├── sponsors/             # 📄 This is a list of *.md files which contain our sponsors
├── assets/               # 🏞️ Images etc...
├── _includes/
│   └── layout.html       # ⚠️ Layout file, describes how the pages are converted to HTML
├── style.css             # 🌈 CSS Styles
└── index.md              # 🏠 Homepage
```

🔥 There are other files in there, please dont touch those 🔥

# Adding a sponsor

To add a sponsor, start by copying an file in the sponsors/ directory. The format of the files is known as [Markdown](https://www.markdownguide.org/getting-started/) with Frontmatter.

[llty.dev](https://www.11ty.dev/) will take those markdown files and build the entire website. There's lots of information on that site though about markdown and frontmatter it might be useful.

## File naming
The file name should have lowercase characters, with a `-` between words and end in `*.md`.

```
my great company!.md  // ❌ shouldn't contain strange characters, i.e. `!`
my great company.md   // ❌ spaces are bad
my-great-company      // ❌ doesn't end in `.md`
my-great-company.md   // ✅ Perfect!
```

## Linking to assets

You can upload media (images, videos, etc..) in the `/assets` directory. And reference it in your document with what's called an absolute path, i.e. starts with `/assets/my-logo.png`. Make sure any files you put in there are small.

## Obfusicating emails

Use `{% obfuscate "email@example.com" %}` will hopefully make it harder for screen readers to scrape emails and spam the receipient.


# Need Help? 🙋‍♂️

Click on "Issues" above, and "New Issue"
