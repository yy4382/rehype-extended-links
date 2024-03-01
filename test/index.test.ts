import rehypeExtendedLinks from "../lib/index.js";
import type { Options } from "../lib/index.ts";
import { assert } from "chai";
import { rehype } from "rehype";

describe("Examples", () => {});

describe("Extended links Tests", () => {
    // input: <a href="http://example.com">?</a>
    // expected: <a href="http://example.com" rel="nofollow">?</a>
    it("should not change a relative link", async () => {
        const input = `<a href="./example.html">relative</a>`;
        const result = await process(input, {});
        const output = `<a href="./example.html">relative</a>`;
        assert.equal(result, output);
    });

    // input: <a href="//example.com">?</a>
    // expected: <a href="//example.com" rel="nofollow">?</a>
    it("should change a protocol-relative link", async () => {
        const input = `<a href="//example.com">?</a>`;
        const result = await process(input, {});
        const output = `<a href="//example.com" rel="nofollow">?</a>`;
        assert.equal(result, output);
    });

    /**
     * input: <a href="http://example.com">?</a>
     * expected:
     * <span class="wrapped-link-container">
     *      <a href="//example.com" class="wrapped-link" rel="nofollow">?</a>
     *      <span class="content">content</span>
     *  </span>
     */
    it("should wrap in span, adding content", async () => {
        const input = `<a href="//example.com">?</a>`;
        const options: Options = {
            content: {
                type: "element",
                tagName: "span",
                properties: { className: ["content"] },
                children: [{ type: "text", value: "content" }],
            },
        };
        const result = await process(input, options);
        const output = `<span class="wrapped-link-container"><a href="//example.com" class="wrapped-link" rel="nofollow">?</a><span class="content">content</span></span>`;
        assert.equal(result, output);
    });

    it("should add preContent", async () => {
        const input = `<a href="//example.com">?</a>`;
        const options: Options = {
            preContentMap: new Map([
                [
                    /example/,
                    {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["content"] },
                        children: [{ type: "text", value: "content" }],
                    },
                ],
            ]),
        };
        const result = await process(input, options);
        const output = `<span class="wrapped-link-container"><span class="content">content</span><a href="//example.com" class="wrapped-link" rel="nofollow">?</a></span>`;
        assert.equal(result, output);
    });
    
    it("should not add rel to a link that does not match the test function",async()=>{
        const input = '<a href="http://example.com">http</a>'
        const options: Options = {
            test: (node) => {
                return node.properties.href === 'http://foobar.com'
            }
        }
        const output = '<a href="http://example.com">http</a>'
        const result = await process(input, options)
        assert.equal(result, output)
    })

    it("Full feature test", async () => {
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

async function process(input: string, options: Options): Promise<string> {
    const result = await rehype()
        .use({ settings: { fragment: true } })
        .use(rehypeExtendedLinks as any, options)
        .process(input);
    return result.toString();
}
