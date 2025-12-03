import "@testing-library/jest-dom/vitest";

interface ObserverRecord {
  callback: IntersectionObserverCallback;
  observer: IntersectionObserver;
}

const elementCallbacks = new Map<Element, ObserverRecord>();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  disconnect(): void {
    elementCallbacks.clear();
  }

  observe(target: Element): void {
    elementCallbacks.set(target, { callback: this.callback, observer: this });
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(target: Element): void {
    elementCallbacks.delete(target);
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver;

globalThis.triggerIntersection = (element: Element, isIntersecting = true) => {
  const record = elementCallbacks.get(element);
  if (!record) return;

  const entry: IntersectionObserverEntry = {
    boundingClientRect: element.getBoundingClientRect(),
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: element.getBoundingClientRect(),
    isIntersecting,
    rootBounds: null,
    target: element,
    time: performance.now(),
  };

  record.callback([entry], record.observer);
};

declare global {
  // eslint-disable-next-line no-var
  var triggerIntersection: (element: Element, isIntersecting?: boolean) => void;
}
