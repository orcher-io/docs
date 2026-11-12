// Text files imported through the asset/source rule in next.config.mjs.
declare module '*.txt' {
  const text: string
  export default text
}
