import type { Element, ElementContent, Properties, Root } from "hast";
import type { Test } from "hast-util-is-element";

// @ts-ignore
import structuredClone from "@ungap/structured-clone";
import { convertElement } from "hast-util-is-element";
import isAbsoluteUrl from "is-absolute-url";
import { parse } from "space-separated-tokens";
import { visit } from "unist-util-visit";

type Content =
    | ElementContent[]
    | CreateContent
    | ElementContent
    | null
    | undefined;

export type PreContentMap = Map<RegExp, Content>;

type CreateContent = (
    element: Element
) => ElementContent[] | ElementContent | null | undefined;

type CreateProperties = (element: Element) => Properties | null | undefined;

type CreateRel = (element: Element) => string[] | string | null | undefined;

type Target = "_blank" | "_self" | "_parent" | "_top";
type CreateTarget = (element: Element) => Target | null | undefined;

export interface Options {
    content?: Content;
    preContentMap?: Map<RegExp, Content>;
    properties?: CreateProperties | Properties | null | undefined;
    protocols?: string[] | null | undefined;
    rel?: string[] | CreateRel | null | undefined;
    target?: CreateTarget | Target | null | undefined;
    test?: Test | null | undefined;
}

const defaultProtocols = ["http", "https"];
const defaultRel = ["nofollow"];

const emptyOptions: Options = {};

export default function rehypeExtendedLinks(
    options: Options | null | undefined
) {
    const settings = options || emptyOptions;
    const protocols = settings.protocols || defaultProtocols;
    const is = convertElement(settings.test);

    return function (tree: Root): undefined {
        visit(tree, "element", function (node, index, parent) {
            if (
                node.tagName === "a" &&
                typeof node.properties.href === "string" &&
                !(node.properties.className as string[] | undefined)?.includes(
                    "wrapped-link"
                ) &&
                is(node, index, parent)
            ) {
                const url = node.properties.href;

                if (
                    isAbsoluteUrl(url)
                        ? protocols.includes(url.slice(0, url.indexOf(":")))
                        : url.startsWith("//")
                ) {
                    const contentRaw = createIfNeeded(settings.content, node);
                    const content =
                        contentRaw && !Array.isArray(contentRaw)
                            ? [contentRaw]
                            : contentRaw;
                    let preContentMapRaw = settings.preContentMap;
                    const preContentMap: Map<RegExp, ElementContent[]> =
                        new Map();
                    preContentMapRaw?.forEach((value, key, map) => {
                        const ele = createIfNeeded(value, node);
                        if (!ele) return;
                        const eleArr = Array.isArray(ele) ? ele : [ele];
                        preContentMap.set(key, eleArr);
                    });

                    const relRaw =
                        createIfNeeded(settings.rel, node) || defaultRel;
                    const rel =
                        typeof relRaw === "string" ? parse(relRaw) : relRaw;
                    const target = createIfNeeded(settings.target, node);

                    const properties = createIfNeeded(
                        settings.properties,
                        node
                    );

                    const wrapped = content || preContentMap.size;

                    if (properties) {
                        if (!properties.className) properties.className = [];
                        if (properties.className === true)
                            properties.className = [];
                        let className = Array.isArray(properties.className)
                            ? properties.className
                            : [properties.className];
                        if (wrapped) className.push("wrapped-link");
                        properties.className = className;
                        Object.assign(
                            node.properties,
                            structuredClone(properties)
                        );
                    } else if (wrapped) {
                        Object.assign(node.properties, {
                            className: ["wrapped-link"],
                        });
                    }

                    if (rel.length > 0) {
                        node.properties.rel = [...rel];
                    }

                    if (target) {
                        node.properties.target = target;
                    }

                    if (!wrapped) return;

                    const rawNode = structuredClone(node);

                    node.tagName = "span";
                    node.properties = {
                        className: ["wrapped-link-container"],
                    };
                    node.children = [rawNode];
                    node.content = undefined;

                    if (content) {
                        node.children.push(...content);
                    }

                    if (preContentMap) {
                        for (const [regex, content] of preContentMap) {
                            if (regex.test(url)) {
                                node.children.unshift(...content);
                            }
                        }
                    }

                    // if (
                    //   url.startsWith('https://github.com') &&
                    //   // @ts-ignore
                    //   !node.properties.className?.includes('github-link')
                    // ) {
                    //   const aNode = structuredClone(node)
                    //   aNode.properties.className = ['github-link']
                    //   node.tagName = 'span'
                    //   node.properties = {className: ['github-link-container']}

                    //   node.children = [
                    //     {
                    //       type: 'element',
                    //       tagName: 'span',
                    //       properties: {
                    //         className: ['rh-pre-content']
                    //       },
                    //       children: [
                    //         {
                    //           type: 'element',
                    //           tagName: 'svg',
                    //           properties: {},
                    //           children: [
                    //             {
                    //               type: 'element',
                    //               tagName: 'use',
                    //               properties: {
                    //                 href: '#mdi--github'
                    //               },
                    //               children: []
                    //             }
                    //           ]
                    //         }
                    //       ]
                    //     },
                    //     aNode,
                    //     {
                    //       type: 'element',
                    //       tagName: 'span',
                    //       properties: {
                    //         className: ['rh-post-content']
                    //       },
                    //       children: [
                    //         {
                    //           type: 'element',
                    //           tagName: 'svg',
                    //           properties: {},
                    //           children: [
                    //             {
                    //               type: 'element',
                    //               tagName: 'use',
                    //               properties: {
                    //                 href: '#mdi--arrow-up-right-thick'
                    //               },
                    //               children: []
                    //             }
                    //           ]
                    //         }
                    //       ]
                    //     }
                    //   ]
                    //   node.content = undefined
                    //   const aNode = structuredClone(node)
                    //   node = {
                    //     type: 'element',
                    //     tagName: 'div',
                    //     properties: {},
                    //     children: [
                    //       {
                    //         type: 'element',
                    //         tagName: 'i',
                    //         properties: {
                    //           class: ['icon-[github]']
                    //         },
                    //         children: []
                    //       },
                    //       aNode,
                    //       {
                    //         type: 'element',
                    //         tagName: 'i',
                    //         properties: {
                    //           class: ['icon-[external]']
                    //         },
                    //         children: []
                    //       }
                    //     ]
                    //   }
                    // }
                }
            }
        });
    };
}

function createIfNeeded<T>(
    value: T,
    element: Element
    // @ts-ignore
): T extends Function ? ReturnType<T> : T {
    return typeof value === "function" ? value(element) : value;
}
