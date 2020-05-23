import parse5 from 'parse5'
import fromParse5 from 'hast-util-from-parse5'
import plugin, { Options } from './index'
import hast from 'hast'
import toHtml from 'hast-util-to-html'

describe('plugin', () => {
  test('replace HTTP URLs to HTTPS using URL object', () => {
    const transform = setup({
      resolve: '@suin/gatsby-transformer-replace-urls',
      options: {
        replace(url) {
          const u = new URL(url)
          if (u.protocol === 'http:') {
            u.protocol = 'https'
          }
          return u
        },
      },
    })
    const output = transform(`<a href="http://example.com/"></a>`)
    expect(output).toBe(`<a href="https://example.com/"></a>`)
  })

  test('replace only img tags', () => {
    const transform = setup({
      resolve: '@suin/gatsby-transformer-replace-urls',
      options: {
        replace(url, attribute, node) {
          if (node.tagName === 'img' && attribute === 'src') {
            const u = new URL(url)
            u.host = 'cdn.example.com'
            return u
          }
          return
        },
      },
    })
    const output = transform(`
        <a href="https://example.com/">
            <img src="https://example.com/logo.png">  
        </a>
    `)
    expect(output).toBe(`
        <a href="https://example.com/">
            <img src="https://cdn.example.com/logo.png">  
        </a>
    `)
  })

  test('replace hash only url', () => {
    const transform = setup({
      resolve: '@suin/gatsby-transformer-replace-urls',
      options: {
        replace(url) {
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
    const output = transform(`<a href="#hash"></a>`)
    expect(output).toBe(`<a href="#new-hash"></a>`)
  })
})

const setup = ({
  options,
}: {
  resolve: '@suin/gatsby-transformer-replace-urls'
  options?: Options
}) => (html: string): string => {
  const inAst = toHast(html)
  // noinspection TypeScriptValidateTypes
  const outAst = plugin(
    { htmlAst: inAst } as Parameters<typeof plugin>[0],
    options as Parameters<typeof plugin>[1],
  )
  return toHtml(outAst)
}

const toHast = (html: string) =>
  fromParse5(parse5.parseFragment(html)) as hast.Root
