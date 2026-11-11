import { useEffect } from 'react';

const BASE_TITLE = '博物馆文物修复与展示系统';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${BASE_TITLE}` : `${BASE_TITLE} - AI驱动的中国传统艺术创作平台`;
    return () => {
      document.title = `${BASE_TITLE} - AI驱动的中国传统艺术创作平台`;
    };
  }, [title]);
}
