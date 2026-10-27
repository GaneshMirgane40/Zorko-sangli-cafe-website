'use client'

import {
  Check,
  Edit2,
  Flame,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  createMenuItemAction,
  deleteMenuItemAction,
  toggleItemAvailability,
  toggleItemFlag,
  updateItemPrice,
} from './menu-actions'

export type MenuItemRow = {
  id: string
  name: string
  slug: string
  description: string
  priceRupees: number
  dietType: 'VEG' | 'NON_VEG' | 'EGG'
  isAvailable: boolean
  isBestSeller: boolean
  isTrending: boolean
  isFeatured: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

export type CategoryOption = {
  id: string
  name: string
  slug: string
}

export function AdminMenuTable({
  initialItems,
  categories,
}: {
  initialItems: MenuItemRow[]
  categories: CategoryOption[]
}) {
  const [items, setItems] = useState<MenuItemRow[]>(initialItems)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filter items
  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || item.category.slug === selectedCategory

    const matchesStock =
      filterStock === 'all' ||
      (filterStock === 'in_stock' && item.isAvailable) ||
      (filterStock === 'out_of_stock' && !item.isAvailable)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Handle Availability Toggle
  const handleToggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i)),
    )
    startTransition(async () => {
      try {
        await toggleItemAvailability(id)
      } catch (err) {
        console.error('Failed to toggle availability', err)
        // Rollback
        setItems(initialItems)
      }
    })
  }

  // Handle Flag Toggle
  const handleToggleFlag = (
    id: string,
    field: 'isBestSeller' | 'isTrending' | 'isFeatured',
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: !i[field] } : i)),
    )
    startTransition(async () => {
      try {
        await toggleItemFlag(id, field)
      } catch (err) {
        console.error(`Failed to toggle ${field}`, err)
      }
    })
  }

  // Handle Price Save
  const handleSavePrice = (id: string) => {
    const p = parseFloat(tempPrice)
    if (isNaN(p) || p <= 0) return
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, priceRupees: p } : i)),
    )
    setEditingPriceId(null)
    startTransition(async () => {
      try {
        await updateItemPrice(id, p)
      } catch (err) {
        console.error('Failed to update price', err)
      }
    })
  }

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    startTransition(async () => {
      try {
        await deleteMenuItemAction(id)
      } catch (err) {
        console.error('Failed to delete item', err)
      }
    })
  }

  return (
    <div className="flex flex-col gap-space-lg">
      {/* ── Top Controls Bar ── */}
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-surface-container-high bg-surface-container-lowest p-space-md shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/70" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name or ingredient…"
            className="h-11 w-full rounded-2xl border border-surface-container-high bg-surface pl-10 pr-4 text-body-md text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-2xl border border-surface-container-high bg-surface px-3 text-body-sm font-medium text-on-surface focus:outline-none"
          >
            <option value="all">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="h-11 rounded-2xl border border-surface-container-high bg-surface px-3 text-body-sm font-medium text-on-surface focus:outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">🟢 In Stock Only</option>
            <option value="out_of_stock">🔴 Out of Stock Only</option>
          </select>

          {/* Add Item Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="gap-2 ml-auto"
          >
            <Plus className="size-4" />
            Add Dish
          </Button>
        </div>
      </div>

      {/* ── Counts Bar ── */}
      <div className="flex flex-wrap items-center justify-between text-body-sm text-on-surface-variant px-1">
        <span>
          Showing <strong className="text-on-surface">{filtered.length}</strong> of{' '}
          {items.length} items
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            {items.filter((i) => i.isAvailable).length} Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500 inline-block" />
            {items.filter((i) => !i.isAvailable).length} Out of Stock
          </span>
        </div>
      </div>

      {/* ── Items Table ── */}
      <div className="overflow-x-auto rounded-3xl border border-surface-container-high bg-surface-container-lowest shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container bg-surface-container-low/50 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="py-3.5 px-4">Item Name</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Price</th>
              <th className="py-3.5 px-3">Availability</th>
              <th className="py-3.5 px-3">Badges</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-body-sm">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors hover:bg-surface-container-low/30 ${
                  !item.isAvailable ? 'opacity-70 bg-surface-container-low/20' : ''
                }`}
              >
                {/* Item Name */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2.5 rounded-full shrink-0 ${
                          item.dietType === 'VEG'
                            ? 'bg-emerald-600'
                            : item.dietType === 'EGG'
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                        }`}
                        title={item.dietType}
                      />
                      <span className="font-heading font-bold text-on-surface">
                        {item.name}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-body-xs text-on-surface-variant truncate max-w-xs mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-3">
                  <span className="inline-block rounded-full bg-surface-container px-2.5 py-0.5 text-label-xs font-semibold text-on-surface">
                    {item.category.name}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3 px-3 font-medium">
                  {editingPriceId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-on-surface font-bold">₹</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-20 h-8 rounded-lg border border-primary px-2 text-body-sm font-bold focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePrice(item.id)}
                        className="p-1 rounded-md bg-primary text-white hover:bg-primary-container"
                        title="Save Price"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1 rounded-md bg-surface-container text-on-surface hover:bg-surface-container-high"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-1.5">
                      <span className="font-heading font-bold text-on-surface">
                        ₹{item.priceRupees}
                      </span>
                      <button
                        onClick={() => {
                          setEditingPriceId(item.id)
                          setTempPrice(String(item.priceRupees))
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-primary transition-opacity"
                        title="Edit Price"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Availability Toggle */}
                <td className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-xs font-bold transition-all border ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        item.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </button>
                </td>

                {/* Badges / Highlights */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    {/* Best Seller */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(item.id, 'isBestSeller')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isBestSeller
                          ? 'bg-amber-100 text-amber-700 font-bold'
                          : 'text-on-surface-variant/40 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title="Best Seller"
                    >
                      <Star className="size-4 fill-current" />
                    </button>

                    {/* Trending */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(item.id, 'isTrending')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isTrending
                          ? 'bg-orange-100 text-orange-700 font-bold'
                          : 'text-on-surface-variant/40 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      title="Trending"
                    >
                      <Flame className="size-4 fill-current" />
                    </button>

                    {/* Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(item.id, 'isFeatured')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isFeatured
                          ? 'bg-sky-100 text-sky-700 font-bold'
                          : 'text-on-surface-variant/40 hover:text-sky-600 hover:bg-sky-50'
                      }`}
                      title="Featured"
                    >
                      <Sparkles className="size-4 fill-current" />
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                    title="Archive/Delete dish"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add New Item Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container-high my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container mb-4">
              <h2 className="font-heading text-headline-sm text-on-surface">Add New Menu Dish</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                const res = await createMenuItemAction({}, formData)
                if (res.success) {
                  setShowAddModal(false)
                  window.location.reload()
                } else if (res.error) {
                  alert(res.error)
                }
              }}
              className="flex flex-col gap-4"
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-label-md font-bold text-on-surface">Dish Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Cheese Burst Aloo Tikki Burger"
                  className="h-11 rounded-xl border border-surface-container-high bg-surface px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-md font-bold text-on-surface">Category *</label>
                  <select
                    name="categoryId"
                    required
                    className="h-11 rounded-xl border border-surface-container-high bg-surface px-3 text-body-md text-on-surface focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-label-md font-bold text-on-surface">Price in ₹ *</label>
                  <input
                    name="priceRupees"
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 99"
                    className="h-11 rounded-xl border border-surface-container-high bg-surface px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Diet Type */}
              <div className="flex flex-col gap-1">
                <label className="text-label-md font-bold text-on-surface">Diet Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                    <input type="radio" name="dietType" value="VEG" defaultChecked />
                    <span className="font-bold text-emerald-700">🟢 100% Veg</span>
                  </label>
                  <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                    <input type="radio" name="dietType" value="EGG" />
                    <span className="font-bold text-amber-700">🟡 Contains Egg</span>
                  </label>
                  <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                    <input type="radio" name="dietType" value="NON_VEG" />
                    <span className="font-bold text-rose-700">🔴 Non-Veg</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-label-md font-bold text-on-surface">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Ingredients, crispiness, flavors..."
                  className="rounded-xl border border-surface-container-high bg-surface p-3 text-body-md text-on-surface focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 py-1">
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input type="checkbox" name="isAvailable" defaultChecked />
                  <span>Available Immediately</span>
                </label>
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input type="checkbox" name="isBestSeller" />
                  <span>Mark Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input type="checkbox" name="isTrending" />
                  <span>Mark Trending</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Dish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

