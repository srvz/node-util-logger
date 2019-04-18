export default interface Logger {
  access (data?: Record<string, any>): any
  error (error: Error, data?: Record<string, any>): any
}