import { CommandHeader, CommandInput, CommandList, CommandMenu } from 'ui-patterns/CommandMenu'
import { useThemeSwitcherCommands } from 'ui-patterns/CommandMenu/prepackaged/ThemeSwitcher'
import { useDocsSearchCommands } from 'ui-patterns/CommandMenu/prepackaged/DocsSearch'

import { useDocsNavCommands } from '../../components/Navigation/Navigation.commands'

const DocsCommandMenu = () => {
  useDocsSearchCommands({
    modify: (command) => ({ ...command, forceMount: true }),
    options: { forceMountSection: true },
  })
  useDocsNavCommands()
  useThemeSwitcherCommands()

  return (
    <CommandMenu>
      <CommandHeader>
        <CommandInput />
      </CommandHeader>
      <CommandList />
    </CommandMenu>
  )
}

export { DocsCommandMenu as default }
