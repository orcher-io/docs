// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
'use client'

import { ComponentProps, PropsWithChildren } from 'react'
import { GlassPanel } from 'ui-patterns/GlassPanel'
import { useTheme } from 'next-themes'

import MenuIconPicker from '~/components/Navigation/NavigationMenu/MenuIconPicker'

type GlassPanelWithIconPickerProps = PropsWithChildren<
  Omit<ComponentProps<typeof GlassPanel>, 'icon'> & { icon: string }
>

function GlassPanelWithIconPicker({ children, icon, ...props }: GlassPanelWithIconPickerProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme?.includes('dark')

  return (
    <GlassPanel
      icon={
        <div
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded"
          style={{ backgroundColor: 'hsl(var(--brand-default))' }}
        >
          <MenuIconPicker
            icon={icon}
            width={18}
            height={18}
            className={isDark ? 'text-white' : 'text-white'}
          />
        </div>
      }
      showIconBg={false}
      {...props}
    >
      {children}
    </GlassPanel>
  )
}

export { GlassPanelWithIconPicker }
