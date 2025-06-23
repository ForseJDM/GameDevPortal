import { useEffect } from 'react';

const useFavicon = (url: string) => {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (link) {
      link.href = url;
    } else {
      link = document.createElement('link');
      link.rel = 'icon';
      link.href = url;
      document.head.appendChild(link);
    }
  }, [url]);
};

export default useFavicon; 