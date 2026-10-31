import type { UserConfig } from '@commitlint/types'

import { RuleConfigSeverity } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // The set of change types this repo uses.
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'test', 'docs', 'perf', 'ci'],
    ],
    // A scope says where the change lands; the list is the package map.
    'scope-empty': [RuleConfigSeverity.Error, 'never'],
    'scope-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['app', 'ui', 'i18n', 'config', 'infra', 'deps'],
    ],
    // Subjects read as lowercase phrases.
    'subject-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
  },
}

export default config
