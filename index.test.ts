import parse5 from 'parse5'
import fromParse5 from 'hast-util-from-parse5'
import plugin, { Options } from './index'
import hast from 'hast'
import toHtml from 'hast-util-to-html'
import gatsby from 'gatsby'

describe('plugin', () => {
  test('replace HTTP URLs to HTTPS using URL object', () => {
    new Plugin()
      .config({
        resolve: '@suin/gatsby-transformer-replace-urls',
        options: {
          replace({ url }) {
            const u = new URL(url)
            if (u.protocol === 'http:') {
              u.protocol = 'https'
            }
            return u
          },
        },
      })
      .transforms(`<a href="http://example.com/"></a>`)
      .becomes(`<a href="https://example.com/"></a>`)
  })

  test('replace only img tags', () => {
    new Plugin()
      .config({
        resolve: '@suin/gatsby-transformer-replace-urls',
        options: {
          replace({ url, attribute, element }) {
            if (element.tagName === 'img' && attribute === 'src') {
              const u = new URL(url)
              u.host = 'cdn.example.com'
              return u
            }
            return
          },
        },
      })
      .transforms(
        `<a href="https://example.com/">
          <img src="https://example.com/logo.png">  
        </a>`,
      )
      .becomes(
        `<a href="https://example.com/">
          <img src="https://cdn.example.com/logo.png">  
        </a>`,
      )
  })

  test('replace hash only URL', () => {
    new Plugin()
      .config({
        resolve: '@suin/gatsby-transformer-replace-urls',
        options: {
          replace({ url }) {
            // In this case, you have to compare the url as a string since
            // `new URL(url)` throws Error like:
            // "TypeError [ERR_INVALID_URL]: Invalid URL: #hash"
            if (url === '#hash') {
              return '#new-hash'
            }
            return
          },
        },
      })
      .transforms(`<a href="#hash"></a>`)
      .becomes(`<a href="#new-hash"></a>`)
  })

  test('replace URLs in a specific node type', () => {
    new Plugin()
      .config({
        resolve: '@suin/gatsby-transformer-replace-urls',
        options: {
          replace({ url, parent }) {
            if (parent.internal.type === 'File') {
              return
            } else {
              // internal.type is ContentfulBlogPost
              const u = new URL(url)
              if (u.protocol === 'http:') {
                u.protocol = 'https'
              }
              return u
            }
          },
        },
      })
      .transforms([
        {
          parentNodeInternalType: 'ContentfulBlogPost',
          html: `<a href="http://example.com/"></a>`,
        },
        {
          parentNodeInternalType: 'File',
          html: `<a href="http://example.com/"></a>`,
        },
      ])
      .becomes([
        {
          parentNodeInternalType: 'ContentfulBlogPost',
          html: `<a href="https://example.com/"></a>`,
        },
        {
          parentNodeInternalType: 'File',
          html: `<a href="http://example.com/"></a>`,
        },
      ])
  })
})

class Plugin {
  private options?: Options
  private html: string = ''
  private nodes: readonly NodeExample[] = []

  config({ options }: PluginConfig): this {
    this.options = options
    return this
  }

  transforms(htmlOrNodes: string | readonly NodeExample[]): this {
    if (typeof htmlOrNodes === 'string') {
      this.html = htmlOrNodes
    } else {
      this.nodes = htmlOrNodes
    }
    return this
  }

  becomes(htmlOrNodes: string | readonly NodeExample[]): this {
    if (typeof htmlOrNodes === 'string') {
      this.becomesHtml(htmlOrNodes)
    } else {
      this.becomesNodes(htmlOrNodes)
    }
    return this
  }

  private becomesHtml(html: string): void {
    const inAst = toHast(this.html)
    const outAst = runPlugin({ htmlAst: inAst }, this.options)
    const actual = toHtml(outAst)
    expect(actual).toBe(html)
  }

  private becomesNodes(expectedNodes: readonly NodeExample[]): void {
    const actualNodes = this.nodes.map(node => {
      const inAst = toHast(node.html)
      const outAst = runPlugin(
        {
          htmlAst: inAst,
          htmlNode: {
            id: '',
            parent: '__parent',
            internal: {
              type: 'HtmlRehype',
              contentDigest: '',
              owner: 'gatsby-transformer-rehype',
            },
            children: [],
          },
          getNode(id: string): gatsby.NodeInput | undefined {
            if (id === '__parent') {
              return {
                id: '__parent',
                internal: {
                  type: node.parentNodeInternalType,
                  contentDigest: '',
                },
                children: [],
              }
            }
            return
          },
        },
        this.options,
      )
      const outHtml = toHtml(outAst)
      return { ...node, html: outHtml }
    })
    expect(actualNodes).toEqual(expectedNodes)
  }
}

type NodeExample = {
  readonly parentNodeInternalType: string
  readonly html: string
}

const runPlugin = (
  {
    htmlAst = {} as hast.Root,
    htmlNode = {} as gatsby.Node,
    getNode = () => {},
  }: Partial<Parameters<typeof plugin>[0]>,
  { replace, plugins = [] }: Partial<Parameters<typeof plugin>[1]> = {},
) => plugin({ htmlAst, htmlNode, getNode }, { replace, plugins })

const toHast = (html: string) =>
  fromParse5(parse5.parseFragment(html)) as hast.Root

type PluginConfig = {
  resolve: '@suin/gatsby-transformer-replace-urls'
  options?: Options
}
