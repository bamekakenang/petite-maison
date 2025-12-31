"use client";
import { useCart } from './cart/CartProvider';
import { useTranslations } from 'next-intl';

export function AddToCartButton({ sku, title, price, image, className="" }:{ sku:string; title:string; price:number; image?:string; className?:string }){
  const { addItem } = useCart();
  const t = useTranslations();
  return (
    <button
      onClick={() => addItem({ sku, title, price, image })}
      className={`rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-red-700 transition ${className}`}
    >
      {t('addToCart')}
    </button>
  );
}
