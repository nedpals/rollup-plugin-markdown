const { createFilter } = require('rollup-pluginutils')
const path = require('path')
const matter = require('gray-matter')

const unified = require('unified')
const remarkParse = require('remark-parse')
const remark2rehype = require('remark-rehype')
const rehypeStringify = require('rehype-stringify')

const markdownPlugin = (options = { remarkPlugins: [], rehypePlugins: [] }) => {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'rollup-plugin-markdown',
    transform(code, id) {
      if (!filter(id) === -1 || path.extname(id) !== '.md') return

      const matterResult = matter(code)
      const html = unified()
        .use(remarkParse)
        .use(options.remarkPlugins)
        .use(remark2rehype)
        .use(options.rehypePlugins)
        .use(rehypeStringify)
        .processSync({ contents: matterResult.content })
        .toString('utf8')
      
      const exportFromModule = JSON.stringify({
        html,
        metadata: matterResult.data,
        filename: path.basename(id),
        path: id,
      })

      return {
        code: `export default ${exportFromModule}`,
        map: { mappings: '' },
      }
    },
  }
}

module.exports = markdownPlugin
