import type { ReactElement } from 'react'

import { useProfileViewModel } from '@roundup/core'
import { Skeleton } from '@roundup/ui'

import { EditProfileForm } from '../../../components/EditProfileForm'
import { TabPage } from '../../../components/TabPage'

/**
 * Edit profile: change your name. The form waits for the profile so the field starts with the
 * current name.
 * @returns The form, or a placeholder while the profile loads.
 */
export default function EditProfileScreen(): ReactElement {
  const { loading, me } = useProfileViewModel()

  return (
    <TabPage>
      {loading || me === undefined ? (
        <Skeleton variant="row" />
      ) : (
        <EditProfileForm id={me.id} name={me.name} />
      )}
    </TabPage>
  )
}
