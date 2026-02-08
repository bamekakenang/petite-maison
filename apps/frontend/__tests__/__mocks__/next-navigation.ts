// Mock next/navigation hooks for testing
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
});

export const usePathname = () => '/fr/produits';

export const useSearchParams = () => new URLSearchParams();
