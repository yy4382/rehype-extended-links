# rehype-extended-links

[![.github/workflows/test.yml](https://github.com/yy4382/rehype-extended-links/actions/workflows/test.yml/badge.svg)](https://github.com/yy4382/rehype-extended-links/actions/workflows/test.yml)

**[rehype](https://github.com/rehypejs/rehype)** plugin, extends feathers for [rehypejs/rehype-external-links](https://github.com/rehypejs/rehype-external-links).

## What is this?

Inherits most of the features from [rehypejs/rehype-external-links](https://github.com/rehypejs/rehype-external-links), extending support for adding `<span>` to both sides of the `<a>` label.

## Install

```bash
npm install rehype-extended-links

yarn add rehype-extended-links

pnpm add rehype-extended-links
```

## Use

```javascript
import rehypeExtendedLinks from "rehype-extended-links";
import { rehype } from "rehype";
const file = await rehype()
  .use(rehypeExtendedLinks, { rel: ["nofollow"] })
  .use(rehypeStringify)
  .process('<a href="https://example.com">Example</a>');

console.log(String(file));
```

## API

This package exports no identifiers.
The default export is `rehypeExtendedLinks`.

### `unified().use(rehypeExternalLinks[, options])`

Automatically add `rel` (and `target`?) to external links.

###### Parameters

- `options` ([`Options`](#options), optional)
  — configuration

###### Returns

Transform ([`Transformer`](https://github.com/unifiedjs/unified#transformer)).

###### Notes

You should [likely not configure `target`][css-tricks].

You should at least set `rel` to `['nofollow']`.
When using a `target`, add `noopener` and `noreferrer` to avoid exploitation
of the `window.opener` API.

When using a `target`, you should set `content` to adhere to accessibility
guidelines by [giving users advanced warning when opening a new window][g201].

### `CreateContent`

Create a target for the element (TypeScript type).

###### Parameters

- `element` ([`Element`][hast-element])
  — element to check

###### Returns

Content to add (`Array<Node>` or `Node`, optional).

### `CreateProperties`

Create properties for an element (TypeScript type).

###### Parameters

- `element` ([`Element`][hast-element])
  — element to check

###### Returns

Properties to add ([`Properties`][hast-properties], optional).

### `CreateRel`

Create a `rel` for the element (TypeScript type).

###### Parameters

- `element` ([`Element`][hast-element])
  — element to check

###### Returns

`rel` to use (`Array<string>`, optional).

### `CreateTarget`

Create a `target` for the element (TypeScript type).

###### Parameters

- `element` ([`Element`][hast-element])
  — element to check

###### Returns

`target` to use ([`Target`][api-target], optional).

### `Content`

Content to add to the link (TypeScript type). A wrapper for [`Element`][hast-element].

```typescript
type Content =
  | ElementContent[]
  | CreateContent
  | ElementContent
  | null
  | undefined;
```

### `PreContentMap`

Map from regex (matching href url) to Content (TypeScript type).

```typescript
export type PreContentMap = Map<RegExp, Content>;
```

### `Options`

###### Fields

- `content` (`Array<Node>`, [`CreateContent`][api-create-content], or `Node`,
  optional)
  — content to insert at the end of external links; will be inserted in a
  `<span>` element; useful for improving accessibility by giving users
  advanced warning when opening a new window
- `preContentMap` ([`PreContentMap`](#precontentmap), optional)
  — map from regex (matching href url) to Content; will be inserted in a
  `<span>` element; can be used to add icon for specific external links
- `properties` ([`CreateProperties`][api-create-properties] or
  [`Properties`][hast-properties], optional)
  — properties to add to the link itself
- `protocols` (`Array<string>`, default: `['http', 'https']`)
  — protocols to see as external, such as `mailto` or `tel`
- `rel` (`Array<string>`, [`CreateRel`][api-create-rel], or `string`,
  default: `['nofollow']`)
  — [link types][mdn-rel] to hint about the referenced documents; pass an
  empty array (`[]`) to not set `rel`s on links; when using a `target`, add `noopener`
  and `noreferrer` to avoid exploitation of the `window.opener` API
- `target` ([`CreateTarget`][api-create-target] or [`Target`][api-target],
  optional)
  — how to display referenced documents; the default (nothing) is to not set
  `target`s on links
- `test` ([`Test`][is-test], optional)
  — extra test to define which external link elements are modified; any test
  that can be given to `hast-util-is-element` is supported

### `Target`

Target (TypeScript type).

###### Type

```ts
type Target = "_blank" | "_parent" | "_self" | "_top";
```

## Note

If `content` or `preContentMap` is set, the `<a>` label will be wrapped in a span.

## Examples

See in [test](test/index.test.ts).

<!-- Definitions -->

[hast-properties]: https://github.com/syntax-tree/hast#properties
[hast-element]: https://github.com/syntax-tree/hast#element
[is-test]: https://github.com/syntax-tree/hast-util-is-element#test
[g201]: https://www.w3.org/WAI/WCAG21/Techniques/general/G201
[css-tricks]: https://css-tricks.com/use-target_blank/
[api-create-content]: #createcontent
[api-create-properties]: #createproperties
[api-create-rel]: #createrel
[api-create-target]: #createtarget
[api-options]: #options
[api-target]: #target
[api-rehype-external-links]: #unifieduserehypeexternallinks-options
