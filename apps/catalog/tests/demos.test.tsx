import { createElement } from 'react'

import { REGISTRY } from '../src/registry'
import { renderInCatalog } from './helpers/render'

describe('demos', () => {
  it.each(REGISTRY.map(({ Demo, title }) => [title, Demo] as const))(
    'renders the %s demo',
    async (_title, Demo) => {
      const { toJSON } = await renderInCatalog(createElement(Demo))

      expect(toJSON()).not.toBeNull()
    },
  )
})
