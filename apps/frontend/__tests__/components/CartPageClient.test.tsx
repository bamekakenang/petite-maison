import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartPageClient } from '../../components/cart/CartPageClient';

const mockRemoveItem = jest.fn();
const mockClear = jest.fn();
const mockUpdateQty = jest.fn();
const mockPersist = jest.fn();

let mockItems: any[] = [];
let mockReady = true;
let mockTotal = 0;

jest.mock('../../components/cart/CartProvider', () => ({
  useCart: () => ({
    items: mockItems,
    removeItem: mockRemoveItem,
    clear: mockClear,
    updateQty: mockUpdateQty,
    total: mockTotal,
    ready: mockReady,
    persist: mockPersist,
  }),
}));

// Mock fetch for checkout
global.fetch = jest.fn();

describe('CartPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockItems = [];
    mockReady = true;
    mockTotal = 0;
  });

  it('should show loading state when cart is not ready', () => {
    mockReady = false;
    render(<CartPageClient continueHref="/fr/produits" />);
    expect(screen.getByText('Chargement du panier…')).toBeInTheDocument();
  });

  it('should show empty cart message when no items', () => {
    mockItems = [];
    render(<CartPageClient continueHref="/fr/produits" />);
    expect(screen.getByText('pages.cart.empty')).toBeInTheDocument();
  });

  it('should show continue shopping link when cart is empty', () => {
    mockItems = [];
    render(<CartPageClient continueHref="/fr/produits" />);
    const link = screen.getByText('pages.cart.continueShopping');
    expect(link).toHaveAttribute('href', '/fr/produits');
  });

  it('should render cart items', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Figurine Vampire', price: 25, qty: 2, image: '/products/fig.webp' },
    ];
    mockTotal = 50;
    render(<CartPageClient continueHref="/fr/produits" />);
    expect(screen.getByText('Figurine Vampire')).toBeInTheDocument();
    expect(screen.getByText('FIG-001 • x2')).toBeInTheDocument();
    expect(screen.getByText('50.00€')).toBeInTheDocument();
  });

  it('should render multiple cart items', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Figurine Vampire', price: 25, qty: 1, image: '' },
      { sku: 'GAM-001', title: 'Jeu Horreur', price: 40, qty: 3, image: '' },
    ];
    mockTotal = 145;
    render(<CartPageClient continueHref="/fr/produits" />);
    expect(screen.getByText('Figurine Vampire')).toBeInTheDocument();
    expect(screen.getByText('Jeu Horreur')).toBeInTheDocument();
    expect(screen.getByText('Total: 145.00€')).toBeInTheDocument();
  });

  it('should call updateQty when +/- buttons are clicked', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Figurine', price: 25, qty: 2, image: '' },
    ];
    mockTotal = 50;
    render(<CartPageClient continueHref="/fr/produits" />);

    const buttons = screen.getAllByRole('button');
    const minusBtn = buttons.find(b => b.textContent === '-');
    const plusBtn = buttons.find(b => b.textContent === '+');

    fireEvent.click(minusBtn!);
    expect(mockUpdateQty).toHaveBeenCalledWith('FIG-001', 1);

    fireEvent.click(plusBtn!);
    expect(mockUpdateQty).toHaveBeenCalledWith('FIG-001', 3);
  });

  it('should call removeItem when remove button is clicked', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Figurine', price: 25, qty: 1, image: '' },
    ];
    mockTotal = 25;
    render(<CartPageClient continueHref="/fr/produits" />);

    const removeBtn = screen.getByText('pages.cart.remove');
    fireEvent.click(removeBtn);
    expect(mockRemoveItem).toHaveBeenCalledWith('FIG-001');
  });

  it('should call clear when clear button is clicked', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Figurine', price: 25, qty: 1, image: '' },
    ];
    mockTotal = 25;
    render(<CartPageClient continueHref="/fr/produits" />);

    const clearBtn = screen.getByText('pages.cart.clear');
    fireEvent.click(clearBtn);
    expect(mockClear).toHaveBeenCalled();
  });

  it('should use fallback image when item has no image', () => {
    mockItems = [
      { sku: 'FIG-001', title: 'Test Product', price: 10, qty: 1 },
    ];
    mockTotal = 10;
    render(<CartPageClient continueHref="/fr/produits" />);
    const img = screen.getByAltText('Test Product');
    expect(img).toHaveAttribute('src', '/products/house.svg');
  });
});
