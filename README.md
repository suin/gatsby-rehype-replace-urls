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
            resolve: '@suin/gatsby-transformer-replace-urls',
            options: {
              replace(url) {
                if (url.protocol === 'http:') {
                  url.protocol = 'https'
                }
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
