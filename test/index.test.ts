import rehypeExtendedLinks from "../lib/index.js";
import type { PreContentMap, Options } from "../lib/index.ts";
import { assert } from "chai";
import { rehype } from "rehype";

describe("Extended links Tests", () => {
    it("should not change a relative link", async () => {
        const input = `<a href="./example.html">relative</a>`;
        const result = String(
            await rehype()
                .use({ settings: { fragment: true } })
                .use(rehypeExtendedLinks as any)
                .process(input)
        );
        const output = `<a href="./example.html">relative</a>`;
        assert.equal(result, output);
    });
    it("should change a protocol-relative link", async () => {
        const input = `<a href="//example.com">?</a>`;
        const result = String(
            await rehype()
                .use({ settings: { fragment: true } })
                .use(rehypeExtendedLinks as any)
                .process(input)
        );
        const output = `<a href="//example.com" rel="nofollow">?</a>`;
        assert.equal(result, output);
    });
    it("should wrap with content", async () => {
        const input = `<a href="//example.com">?</a>`;
        const result = String(
            await rehype()
                .use({ settings: { fragment: true } })
                .use(rehypeExtendedLinks as any, {
                    content: {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["content"] },
                        children: [{ type: "text", value: "content" }],
                    },
                })
                .process(input)
        );
        const output = `<span class="wrapped-link-container"><a href="//example.com" class="wrapped-link" rel="nofollow">?</a><span class="content">content</span></span>`;
        assert.equal(result, output);
    });
    it("should wrap with content", async () => {
        const input = `<a href="//example.com">?</a>`;
        const preContentMap: PreContentMap = new Map();
        preContentMap.set(/example/, {
            type: "element",
            tagName: "span",
            properties: { className: ["content"] },
            children: [{ type: "text", value: "content" }],
        });
        const options: Options = {
            preContentMap: preContentMap,
        };
        const result = String(
            await rehype()
                .use({ settings: { fragment: true } })
                .use(rehypeExtendedLinks as any, options)
                .process(input)
        );
        const output = `<span class="wrapped-link-container"><span class="content">content</span><a href="//example.com" class="wrapped-link" rel="nofollow">?</a></span>`;
        assert.equal(result, output);
    });
    it("Github full test", async () => {
        const input = `<a href="https://github.com/abc">?</a>`;
        const options: Options = {
            preContentMap: new Map([
                [
                    /^(https?:\/\/)?(www\.)?github\.com\/.*/i,
                    {
                        type: "element",
                        tagName: "span",
                        properties: {
                            className: ["rh-post-content"],
                        },
                        children: [
                            {
                                type: "element",
                                tagName: "svg",
                                properties: {},
                                children: [
                                    {
                                        type: "element",
                                        tagName: "use",
                                        properties: {
                                            href: "#mdi--github",
                                        },
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            ]),
            content: {
                type: "element",
                tagName: "span",
                properties: {
                    className: ["rh-pre-content"],
                },
                children: [
                    {
                        type: "element",
                        tagName: "svg",
                        properties: {},
                        children: [
                            {
                                type: "element",
                                tagName: "use",
                                properties: {
                                    href: "#mdi--arrow-up-right-thick",
                                },
                                children: [],
                            },
                        ],
                    },
                ],
            },
        };
        const result = String(
            await rehype()
                .use({ settings: { fragment: true } })
                .use(rehypeExtendedLinks as any, options)
                .process(input)
        );
        const output = `<span class="wrapped-link-container"><span class="rh-post-content"><svg><use href="#mdi--github"></use></svg></span><a href="https://github.com/abc" class="wrapped-link" rel="nofollow">?</a><span class="rh-pre-content"><svg><use href="#mdi--arrow-up-right-thick"></use></svg></span></span>`;
        assert.equal(result, output);
    });
});
