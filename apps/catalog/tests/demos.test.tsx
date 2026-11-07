import { createElement } from 'react'

import { Render } from './helpers/render'
import { REGISTRY } from '@/registry'

describe('demos', () => {
  it.each(REGISTRY.map(({ Demo, title }) => [title, Demo] as const))(
    'renders the %s demo',
    async (_title, Demo) => {
      const { toJSON } = await Render.inCatalog(createElement(Demo))

      expect(toJSON()).not.toBeNull()
    },
  )
})
