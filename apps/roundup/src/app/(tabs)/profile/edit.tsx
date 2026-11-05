import type { ReactElement } from 'react'

import { useProfileViewModel } from '@roundup/core'
import { Skeleton } from '@roundup/ui'

import { EditProfileForm } from '../../../components/EditProfileForm'

/**
 * Edit profile: change your name. The form waits for the profile so the field starts with the
 * current name.
 * @returns The form, or a placeholder while the profile loads.
 */
export default function EditProfileScreen(): ReactElement {
  const { loading, me } = useProfileViewModel()

  if (loading || me === undefined) return <Skeleton variant="row" />

  return <EditProfileForm id={me.id} name={me.name} />
}
