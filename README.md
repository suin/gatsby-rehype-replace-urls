# @suin/gatsby-rehype-replace-urls

Gatsby rehype plugin that rewrites URLs of src/href attributes.

## Install

```
yarn add gatsby-transformer-rehype @suin/gatsby-rehype-replace-urls
```

## How to use

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-rehype`,
      options: {
        plugins: [
          {
            resolve: '@suin/gatsby-rehype-replace-urls',
            options: {
              replace({ url }) {
                const u = new URL(url)
                if (u.protocol === 'http:') {
                  u.protocol = 'https'
                }
                return u
              },
            },
          },
        ],
      },
    },
  ]
}
```

* To know the parameter of the `replace` function, see [API doc](https://suin.github.io/gatsby-rehype-replace-urls/modules/_index_.plugin.html#replaceparams).
* To learn more examples, see [index.test.ts](./index.test.ts).
