const { createFilter } = require('rollup-pluginutils')
const path = require('path')
const matter = require('gray-matter')

const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')
const remark2rehype = require('remark-rehype')
const rehypeStringify = require('remark-stringify')

const markdownPlugin = (options = { remarkPlugins: [], rehypePlugins: [] }) => {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'rollup-plugin-markdown',
    transform(code, id) {
      if (!filter(id) === -1) return

      const extension = path.extname(id)

      if (extension !== '.md') return

      const matterResult = matter(code)
      let ast = {
        code: `export default {}`,
        map: { mappings: '' },
      }

      unified()
        .use(remarkParse)
        .use(options.remarkPlugins)
        .use(remarkStringify)
        .use(remark2rehype)
        .use(options.rehypePlugins)
        .use(rehypeStringify)
        .process(matterResult.content, (err, file) => {
          if (err) {
            this.error(err)
            return
          }

          const html = file.toString('utf-8');
          const exportFromModule = JSON.stringify({
            html,
            metadata: matterResult.data,
            filename: path.basename(id),
            path: id,
          })

          ast = {
            code: `export default ${exportFromModule}`,
            map: { mappings: '' },
          }
        })
      
      return ast
    },
  }
}

module.exports = markdownPlugin
