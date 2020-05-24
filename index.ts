import { Plugin } from 'gatsby-transform-rehype'
import visit from 'unist-util-visit'
import hast from 'hast'
import { URL } from 'url'
import gatsby, { Node } from 'gatsby'
import { Replacer } from './index'

const plugin: Plugin<plugin.Options, 'htmlAst' | 'htmlNode' | 'getNode'> = (
  { htmlAst, htmlNode: node, getNode },
  options,
) => {
  const { replace: replacer } = options ?? {}
  const parent = getNode(node.parent)
  if (replacer !== undefined) {
    visit<hast.Element>(htmlAst, 'element', element => {
      replace({ element, attribute: 'href', replacer, node, parent, getNode })
      replace({ element, attribute: 'src', replacer, node, parent, getNode })
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
  export type Replace = (params: ReplaceParams) => URL | string | void

  /**
   * The parameters of the replace function.
   */
  export type ReplaceParams = {
    /**
     * The original URL to replace
     */
    readonly url: string

    /**
     * The attribute name that has the URL
     */
    readonly attribute: string

    /**
     * The [Element](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/hast/index.d.ts#L45) that has the URL
     */
    readonly element: hast.Element

    /**
     * HtmlRehype node
     */
    readonly node: Node

    /**
     * HtmlRehype's parent node
     */
    readonly parent: Node

    /**
     * Gatsby utility function to get a node from node ID
     */
    readonly getNode: gatsby.NodePluginArgs['getNode']
  }
}

const replace = ({
  replacer,
  attribute,
  element,
  node,
  parent,
  getNode,
}: Omit<plugin.ReplaceParams, 'url'> & {
  readonly replacer: Replacer
}): void => {
  if (
    typeof element.properties === 'object' &&
    typeof element.properties[attribute] === 'string'
  ) {
    let url = element.properties[attribute] as string
    const replacers = typeof replacer === 'function' ? [replacer] : replacer
    for (const replacer of replacers) {
      const result = replacer({
        url,
        attribute,
        element,
        node,
        parent,
        getNode,
      })
      if (result !== undefined) {
        url = `${result}`
      }
    }
    element.properties[attribute] = url
  }
}

export = plugin
