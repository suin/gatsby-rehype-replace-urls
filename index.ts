import { Plugin } from 'gatsby-transform-rehype'
import visit from 'unist-util-visit'
import hast from 'hast'
import { URL } from 'url'

const plugin: Plugin<plugin.Options> = ({ htmlAst }, options) => {
  const { replace: replacers } = options ?? {}
  if (replacers !== undefined) {
    visit<hast.Element>(htmlAst, 'element', node => {
      replace(node, 'href', replacers)
      replace(node, 'src', replacers)
    })
  }
  return htmlAst
}

namespace plugin {
  export type Options = {
    readonly replace?: Replacer
  }

  export type Replacer = Replace | ReadonlyArray<Replace>

  /**
   * A function type that replaces the given URL.
   */
  export type Replace = {
    /**
     * @param url The original URL
     * @param attribute The attribute name that has the URL
     * @param node The [Element](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/hast/index.d.ts#L45) that has the URL
     * @returns The new URL
     */
    (url: string, attribute: string, node: hast.Element): URL | string | void
  }
}

const replace = (
  node: hast.Element,
  attribute: string,
  replacer: plugin.Replacer,
): void => {
  if (
    typeof node.properties === 'object' &&
    typeof node.properties[attribute] === 'string'
  ) {
    let url = node.properties[attribute] as string
    const replacers = typeof replacer === 'function' ? [replacer] : replacer
    for (const replacer of replacers) {
      const result = replacer(url, attribute, node)
      if (result !== undefined) {
        url = `${result}`
      }
    }
    node.properties[attribute] = url
  }
}

export = plugin
