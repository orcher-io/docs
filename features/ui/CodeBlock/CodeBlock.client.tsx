'use client'

import { Check, Copy, WrapText, ArrowRightFromLine } from 'lucide-react'
import { useCallback, useState, useRef } from 'react'
import { cn, copyToClipboard, Tooltip, TooltipContent, TooltipTrigger } from 'ui'

export function CodeCopyButton({ className, content }: { className?: string; content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    copyToClipboard(content, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'border rounded-md p-1',
        copied && 'bg-selection',
        'hover:bg-selection transition',
        className
      )}
    >
      {copied ? (
        <Check size={14} className="text-lighter" />
      ) : (
        <Copy size={14} className="text-lighter" />
      )}
    </button>
  )
}

export function CodeBlockControls({ content }: { content: string }) {
  const [isWrapped, setIsWrapped] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const toggleWrap = useCallback(() => {
    setIsWrapped((prev) => {
      const newValue = !prev
      // Find the parent code block and toggle the wrap data attribute
      const codeBlock = wrapperRef.current?.closest('.shiki')
      if (codeBlock) {
        if (newValue) {
          codeBlock.setAttribute('data-wrapped', 'true')
        } else {
          codeBlock.removeAttribute('data-wrapped')
        }
      }
      return newValue
    })
  }, [])

  return (
    <div ref={wrapperRef} className="hidden group-hover:flex absolute top-2 right-2 gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleWrap}
            className={cn('border rounded-md p-1', 'hover:bg-selection transition')}
            aria-label={isWrapped ? 'Disable word wrap' : 'Enable word wrap'}
          >
            {isWrapped ? (
              <ArrowRightFromLine size={14} className="text-lighter" />
            ) : (
              <WrapText size={14} className="text-lighter" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{isWrapped ? 'Disable word wrap' : 'Enable word wrap'}</TooltipContent>
      </Tooltip>
      <CodeCopyButton content={content} />
    </div>
  )
}
