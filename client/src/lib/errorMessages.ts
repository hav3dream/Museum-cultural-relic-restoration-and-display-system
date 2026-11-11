/**
 * Shared error message handler for AI processing pages.
 * Converts raw API/network errors into user-friendly Chinese messages.
 */
export function getErrorMessage(error: string | unknown | undefined): string {
  if (!error) return '提交失败，请重试';
  const errorStr = typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : String(error || '');
  if (errorStr.includes('ECONNREFUSED') || errorStr.includes('connection refused')) {
    return 'AI服务连接失败，请确保后端服务正在运行';
  }
  if (errorStr.includes('timeout') || errorStr.includes('ETIMEDOUT')) {
    return '请求超时，请检查网络连接或稍后重试';
  }
  if (errorStr.includes('404')) {
    return '服务接口不存在，请检查后端配置';
  }
  if (errorStr.includes('500')) {
    return '服务器内部错误，请稍后重试';
  }
  return errorStr || '未知错误';
}
