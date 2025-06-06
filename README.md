# md-tools
Tools and utilities for markdown.

This package contains the following utilities:
- `unbundle`
- _...more will hopefully follow..._

## Unbundle
This command extracts base64 embedded images from a markdown file.

### Objective
When you download a Google docsument as markdown, it exports a one-file markdown document, images are embedded inside the document as base64 png objects.
This utility extracts those base64 images to separate png files and changes the main markdown file inserting links to the png files.

### How to use
To launch it you can use:

```bash
> npx --package=@fmpanelli/md-tools unbundle <markdown-file-path> <output-directory>
```
