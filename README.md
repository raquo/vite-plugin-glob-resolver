# Glob Resolver Vite Plugin

This [Vite](https://vitejs.dev/) plugin lets you import resources by their glob pattern when you prefix their name with `@find/`, for example if you `import "@find/**/foo.css"`, the plugin will use the [glob](https://github.com/isaacs/node-glob) package to find foo.css anywhere in your project, and will rewrite the import to import that file statically by its full path.


## Motivation – [Scala.js](https://www.scala-js.org/)

In Javascript or Typescript, you can import local resources with a relative path, for example if you have `foo.js` and `foo.css` in the same directory, you can say `import "./foo.css"` in `foo.js`, and this will work. This lets us place the components' CSS stylesheets right next to their JS files.

However, in Scala.js we can't really use relative paths for JS/CSS imports, because Scala.js combines multiple .scala source files in the directory tree into a flat list of JS files, and for reasons that are too complicated to explain here, it's not possible to rewrite the relative import paths to match the output, so those relative paths don't work anymore when executed in the context of the resulting JS files. See [discussion in Discord](https://discord.com/channels/632150470000902164/635668814956068864/1161932392009826314).

And so, our approach to avoid manually writing out very long paths is to have Vite locate the imported files by a compact glob pattern.


## Usage

If writing Scala.js: `JSImport("@find/**/foo.css")`

**You will also want my [import-side-effect](https://github.com/raquo/vite-plugin-import-side-effect) plugin if importing CSS from Scala.js**.

If writing JS: `import "@find/**/foo.css"`

In this example, `**/foo.css` is the glob pattern handed off to the [glob](https://github.com/isaacs/node-glob) package. Usually "**/foo.css" is enough to find the file, but if you get an error saying that multiple files matched the pattern, you will need to provide a more specific pattern to disambiguate the import, e.g. by specifying part of the path: `**/foo/foo.css`.

Of course, you can also import JS files, e.g. if you want to manually write a JS file, and then create a facade to use it from Scala.js, e.g.: `JSImport("@find/**/foo.js")`. See also docs for [writing Scala.js facade types](https://www.scala-js.org/doc/interoperability/facade-types.html).

Install this plugin:

```
npm i -D @raquo/vite-plugin-glob-resolver
```

Add to `vite.config.js`:

```js
import globResolverPlugin from "@raquo/vite-plugin-glob-resolver";
import { defineConfig } from 'vite'
  
// MAKE SURE TO ADD IT TO VITE'S `plugins` option in `defineConfig`:
export default defineConfig({
  ...
  plugins: [
    ...
    globResolverPlugin({
      // `cwd` specifies the base path where @find should look for files.
      //   - `__dirname` is a node.js magic var containing the directory where
      //     the current file (vite.config.js I guess) is located.
      //   - Adjust `cwd` as needed depending on where your files are located.
      cwd: __dirname,
      // file paths (glob patterns) to ignore, relative to `cwd`
      ignore: [
        'node_modules/**',
        'target/**' // relevant to Scala.js only
      ]
    }),
    ...
  ],
  ...
})
```

See example usage in the [laminar demo project](https://github.com/raquo/laminar-full-stack-demo/blob/master/client/vite.config.js).

See [Vite docs on using plugins](https://vite.dev/guide/using-plugins).

As you can see in the [very short source](https://github.com/raquo/vite-plugin-glob-resolver/blob/master/index.js), this plugin throws errors prefixed with `globResolverPlugin:`. If you see other errors that mention vite's inability to resolve your `@find/...` string, they are likely coming from Vite itself, and may indicate that this plugin is not loaded correctly, so double-check your vite config, e.g. ensure you've added `globResolverPlugin(...)` to `plugins`.


## Author

Nikita Gazarov – [@raquo](https://twitter.com/raquo)


## License

This project is provided under the MIT license.
