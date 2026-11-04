import { createElement } from 'react'

import { REGISTRY } from '../src/registry'
import { Render } from './helpers/render'

describe('demos', () => {
  it.each(REGISTRY.map(({ Demo, title }) => [title, Demo] as const))(
    'renders the %s demo',
    async (_title, Demo) => {
      const { toJSON } = await Render.inCatalog(createElement(Demo))

      expect(toJSON()).not.toBeNull()
    },
  )
})
