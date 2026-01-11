"use client";

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  locale: string;
};

export function AddProductPageClient({ locale }: Props) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [category, setCategory] = useState('figurines');
  const [imageUrl, setImageUrl] = useState('');
  const [minStock, setMinStock] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedId(null);

    setLoading(true);
    try {
      const payload: any = {
        sku: sku.trim(),
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
      };
      if (description.trim()) payload.description = description.trim();
      if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();
      if (minStock.trim()) payload.minStock = Number(minStock);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'create_product_failed');
      }

      // Backend shape: { success: true, data: { ...product } }
      const id = data?.data?.id;
      if (typeof id === 'number') setCreatedId(id);

      // Reset minimal fields after success
      setSku('');
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
      setMinStock('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'create_product_failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="bg-white text-neutral-900 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">SKU *</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
              placeholder="FIG-9999"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Catégorie *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
              required
            >
              <option value="figurines">Figurines</option>
              <option value="games">Jeux</option>
              <option value="bluray">Blu-ray</option>
              <option value="comics">BD</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Nom *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
            placeholder="Masque vintage…"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 min-h-[100px]"
            placeholder="Détails du produit…"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Prix (€) *</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
              placeholder="19.99"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock *</label>
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
              placeholder="10"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock minimum</label>
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
              placeholder="2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2"
            placeholder="https://…"
          />
        </div>

        {error && <div className="text-sm text-red-600">Erreur: {error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? 'Création…' : 'Créer le produit'}
        </button>
      </form>

      {createdId !== null && (
        <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-4">
          <div className="font-semibold">✅ Produit créé (id: {createdId})</div>
          <div className="text-sm text-neutral-200 mt-2">
            <Link className="underline" href={`/${locale}/produits`}>
              Aller à la boutique
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
