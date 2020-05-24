declare module 'gatsby-transform-rehype' {
  import gatsby from 'gatsby'
  import hast from 'hast'

  export interface PluginArgs extends gatsby.NodePluginArgs {
    htmlAst: hast.Root
    htmlNode: gatsby.Node
    generateTableOfContents: (htmlAst: hast.Root) => unknown[]
    basePath: string
    getCache: (id: string) => gatsby.Cache['cache']
  }

  export type Plugin<
    T extends object = object,
    U extends keyof PluginArgs = keyof PluginArgs
  > = (
    args: Pick<PluginArgs, U>,
    options?: T & gatsby.PluginOptions,
  ) => hast.Root
}
