'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trash2,
  Folder,
  FolderOpen,
  Info,
  AlertCircle
} from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, mapCategoryFromAPI } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';
import { categoryFormSchema } from '@/lib/schemas';
import { formatZodErrors } from '@/lib/validate';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
  remark?: string;
  minQuantity?: number;
  minimum_threshold?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  function buildCategoryTree(flat: { id: string; name: string; parentId: string | null }[]): Category[] {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    flat.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });
    flat.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  function getAllCategoryIds(categories: Category[]): Set<string> {
    const ids = new Set<string>();
    const traverse = (cats: Category[]) => {
      cats.forEach((cat) => {
        ids.add(cat.id);
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      });
    };
    traverse(categories);
    return ids;
  }

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories();
      const mapped = data.map(mapCategoryFromAPI);
      const tree = buildCategoryTree(mapped);
      setCategories(tree);
      setExpandedCategories(getAllCategoryIds(tree));
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    remark: '',
    minQuantity: '' as number | '',
  });
  const [parentNameInput, setParentNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getCategoryNameById = (id: string, cats: Category[] = categories): string => {
    for (const c of cats) {
      if (c.id === id) return c.name;
      if (c.children) {
        const found = getCategoryNameById(id, c.children);
        if (found) return found;
      }
    }
    return '';
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openModal = (category?: Category, parentId?: string) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        parentId: category.parentId || '',
        remark: category.remark || '',
        minQuantity: category.minQuantity ?? '',
      });
      setParentNameInput(category.parentId ? getCategoryNameById(category.parentId) : '');
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        parentId: parentId || '',
        remark: '',
        minQuantity: '',
      });
      setParentNameInput(parentId ? getCategoryNameById(parentId) : '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', parentId: '', remark: '', minQuantity: '' });
    setParentNameInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = categoryFormSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await updateCategory(Number(editingCategory.id), {
          name: formData.name,
          minimumThreshold: formData.minQuantity === '' ? 0 : Number(formData.minQuantity),
          remark: formData.remark || undefined,
        });
      } else {
        await createCategory({
          name: formData.name,
          parentId: formData.parentId ? Number(formData.parentId) : null,
          minimumThreshold: formData.minQuantity === '' ? 0 : Number(formData.minQuantity),
          remark: formData.remark || undefined,
        });
      }
      closeModal();
      toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      await loadCategories();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setConfirmDelete(categoryId);
  };

  const confirmDeleteCategory = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCategory(Number(confirmDelete));
      toast.success('Category deleted successfully');
      await loadCategories();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete category');
    } finally {
      setConfirmDelete(null);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="w-full">
        <div
          onClick={() => hasChildren && toggleExpand(category.id)}
          className={`group flex items-center justify-between py-3 px-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer ${
            level > 0 ? 'bg-slate-50/30' : 'bg-white'
          }`}
          style={{ paddingLeft: `${Math.max(1, level * 2)}rem` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <div className="p-1 hover:bg-slate-200/70 rounded text-slate-500 transition-colors">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ) : (
              <div className="w-6" />
            )}

            <div className="flex items-center gap-2 text-slate-400">
              {hasChildren ? (
                isExpanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              <span className="font-medium text-slate-700 truncate">{category.name}</span>
              
              {(category.remark || category.minQuantity !== undefined) && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {category.minQuantity !== undefined && category.minQuantity !== 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200/60">
                      Min Qty: {category.minQuantity}
                    </span>
                  )}
                  {category.remark && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 max-w-xs truncate">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{category.remark}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-4 shrink-0">
            {level === 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); openModal(undefined, category.id); }}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Add subcategory"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); openModal(category); }}
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              title="Edit category"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative before:absolute before:left-[1.65rem] before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 antialiased">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500 mt-1">Organize and structure inventory item classifications.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl shadow-sm shadow-blue-500/10 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Alert Error Box */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No categories setup</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Get started by creating your primary high-level categories.</p>
            <button 
              onClick={() => openModal()} 
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Add your first category &rarr;
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((category) => renderCategory(category))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          
          {/* Modal content container */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {editingCategory ? 'Edit Category' : formData.parentId ? 'New Subcategory' : 'New Parent Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {parentNameInput && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Parent Category</label>
                  <input type="text" value={parentNameInput} disabled className="w-full px-3 py-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg cursor-not-allowed font-medium text-sm" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text" value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFieldErrors({}); }}
                  className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-shadow ${fieldErrors.name ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="e.g., Electronics, Raw Materials" required autoFocus
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              {(formData.parentId || editingCategory?.parentId) && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Remark</label>
                    <textarea
                      rows={3} value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-shadow resize-none"
                      placeholder="Optional notes or details regarding subcategory layout..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Minimum Stock Alert Threshold</label>
                    <input
                      type="number" min={0} value={formData.minQuantity}
                      onChange={(e) => { setFormData({ ...formData, minQuantity: e.target.value === '' ? '' : Number(e.target.value) }); setFieldErrors({}); }}
                      className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-shadow ${fieldErrors.minQuantity ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="Leaves empty or 0 if unmonitored"
                    />
                    {fieldErrors.minQuantity && <p className="text-red-500 text-xs mt-1">{fieldErrors.minQuantity}</p>}
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-2 border border-slate-200 font-medium text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors" 
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 font-medium text-sm text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10" 
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmDelete !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}