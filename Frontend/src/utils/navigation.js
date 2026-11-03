const previousPages = [];
let currentPage = null;

export function trackPageVisit(pathname, url, navigationType) {
  if (!currentPage) {
    currentPage = { pathname, url };
    return;
  }

  if (pathname === currentPage.pathname) {
    currentPage = { pathname, url };
    return;
  }

  if (navigationType === "POP") {
    const previousIndex = previousPages.findLastIndex(
      (page) => page.pathname === pathname
    );

    if (previousIndex >= 0) {
      previousPages.splice(previousIndex);
    }

    currentPage = { pathname, url };
    return;
  }

  if (navigationType === "REPLACE") {
    currentPage = { pathname, url };
    return;
  }

  previousPages.push(currentPage);
  currentPage = { pathname, url };
}

export function navigateBack(navigate, fallback) {
  const previousPage = previousPages.pop();
  const destination = previousPage?.url || fallback;

  currentPage = previousPage || currentPage;
  navigate(destination, { replace: true });
}
