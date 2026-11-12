// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
const escapeAttributeSelector = (str: string) => encodeURIComponent(str)

export { escapeAttributeSelector }
export { generateCommandClassNames } from '../internal/Command'
export { orderSectionFirst } from '../internal/state/commandsState'
export { PageType } from '../internal/state/pagesState'
