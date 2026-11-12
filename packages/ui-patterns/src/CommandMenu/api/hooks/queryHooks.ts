// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import { useSnapshot } from 'valtio'

import { useCommandContext } from '../../internal/Context'

const useQuery = () => {
  const { queryState } = useCommandContext()
  const { query } = useSnapshot(queryState)
  return query
}

const useSetQuery = () => {
  const { queryState } = useCommandContext()
  const { setQuery } = useSnapshot(queryState)
  return setQuery
}

export { useQuery, useSetQuery }
