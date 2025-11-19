/* eslint-disable */
// Type shim for the virtual '@payload-config' module used by Payload.
// This is hand-written and SHOULD be committed. It is NOT a generated file.
declare module '@payload-config' {
  const config: Promise<import('payload').Config>
  export default config
}
