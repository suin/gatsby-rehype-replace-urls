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
              replace(url) {
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

More examples see [index.test.ts](./index.test.ts).
