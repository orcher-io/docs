import { Fragment, type PropsWithChildren } from 'react'
import { bundledLanguages, createHighlighter, type BundledLanguage, type ThemedToken } from 'shiki'
import { cn } from 'ui'

import { CodeBlockControls } from './CodeBlock.client'
import { getFontStyle } from './CodeBlock.utils'
import theme from './orcher.json' with { type: 'json' }

const BUNDLED_LANGUAGES = Object.keys(bundledLanguages)
const highlighter = await createHighlighter({
  themes: [theme],
  langs: BUNDLED_LANGUAGES,
})

export async function CodeBlock({
  className,
  lang: langSetting,
  lineNumbers = true,
  contents,
  children,
}: PropsWithChildren<{
  className?: string
  lang?: string
  lineNumbers?: boolean
  contents?: string
}>) {
  const code = (contents || extractCode(children)).trim()
  const lang = tryToBundledLanguage(langSetting || '') || extractLang(children)

  const { tokens } = highlighter.codeToTokens(code, {
    lang: lang || undefined,
    theme: 'Orcher Theme',
  })

  return (
    <div
      className={cn(
        'shiki',
        'group',
        'relative',
        'not-prose',
        'w-full overflow-x-auto',
        'border border-default rounded-lg',
        'bg-200',
        'text-xs',
        className
      )}
    >
      <pre>
        <code className={lineNumbers ? 'grid grid-cols-[auto_1fr]' : ''}>
          {lineNumbers ? (
            <>
              {tokens.map((line, idx) => (
                <Fragment key={idx}>
                  <div
                    className={cn(
                      'select-none text-right text-muted bg-control px-2 min-h-5 leading-5',
                      idx === 0 && 'pt-6',
                      idx === tokens.length - 1 && 'pb-6'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={cn(
                      'code-content min-h-5 leading-5 pl-6 pr-6',
                      idx === 0 && 'pt-6',
                      idx === tokens.length - 1 && 'pb-6'
                    )}
                  >
                    <CodeLine tokens={line} />
                  </div>
                </Fragment>
              ))}
            </>
          ) : (
            <div className="code-content p-6">
              {tokens.map((line, idx) => (
                <CodeLine key={idx} tokens={line} />
              ))}
            </div>
          )}
        </code>
      </pre>
      <CodeBlockControls content={code.trim()} />
    </div>
  )
}

function CodeLine({ tokens: rawTokens }: { tokens: Array<ThemedToken> }) {
  let offset = 0
  const tokens = rawTokens.map((token) => {
    const newToken = { ...token, offset }
    offset += token.content.length
    return newToken
  })

  return (
    <span className="block min-h-5 leading-5">
      {tokens.map((token) => (
        <span
          key={token.offset}
          style={{ color: token.color, ...getFontStyle(token.fontStyle || 0) }}
        >
          {token.content}
        </span>
      ))}
    </span>
  )
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  const child = Array.isArray(children) ? children[0] : children
  if (!!child && typeof child === 'object' && 'props' in child) {
    const props = child.props
    if (!!props && typeof props === 'object' && 'children' in props) {
      const code = props.children
      if (typeof code === 'string') return code
    }
  }
  return ''
}

function extractLang(children: React.ReactNode): BundledLanguage | null {
  if (typeof children === 'string') return null
  const child = Array.isArray(children) ? children[0] : children
  if (!!child && typeof child === 'object' && 'props' in child) {
    const props = child.props
    if (!!props && typeof props === 'object' && 'className' in props) {
      const className = props.className
      if (typeof className === 'string') {
        const lang = className.split(' ').find((className) => className.startsWith('language-'))
        return lang ? tryToBundledLanguage(lang.replace('language-', '')) : null
      }
    }
  }
  return null
}

function tryToBundledLanguage(lang: string): BundledLanguage | null {
  if (BUNDLED_LANGUAGES.includes(lang)) {
    return lang as BundledLanguage
  }
  return null
}
