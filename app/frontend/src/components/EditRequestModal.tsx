// ...existing code...
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getCategories } from '../features/category/services/categoryService';
import { urgencyLevels } from "../constants/urgency_level";

type Request = {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  urgency_level?: string;
  location?: string;
  deadline?: string;
  volunteer_number?: number;
};

type EditModalProps = {
  open: boolean;
  request: Request | null;
  onClose: () => void;
  onSubmit: (payload: Partial<Request>) => Promise<void>;
};

type Category = {
  name: string;
  value: string;
  task_value: number;
};

const EditRequestModal: React.FC<EditModalProps> = ({ open, request, onClose, onSubmit }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [formState, setFormState] = useState({
    title: '',
    description: '',
    category: '',
    urgency_level: '',
    location: '',
    deadline: '',
    volunteer_number: 1,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Omit<Category, 'task_value'>[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const options: Omit<Category, 'task_value'>[] = (data ?? []).map((category: Category) => ({
          value: category.value,
          name: category.name,
        }));
        setCategories(options);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    const handleCancel = (event: Event) => {
      if (saving) {
        event.preventDefault();
      } else {
        onClose();
      }
    };

    dialogEl.addEventListener('cancel', handleCancel);
    return () => dialogEl.removeEventListener('cancel', handleCancel);
  }, [onClose, saving]);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    if (open && !dialogEl.open) {
      dialogEl.showModal();
    } else if (!open && dialogEl.open) {
      dialogEl.close();
    }
  }, [open]);

  useEffect(() => {
    if (request) {
      setFormState({
        title: request.title ?? '',
        description: request.description ?? '',
        location: request.location ?? '',
        deadline: request.deadline ? request.deadline.slice(0, 16) : '',
        volunteer_number: request.volunteer_number ?? 1,
        category: request.category ?? '',
        urgency_level: request.urgency_level ?? '',
      });
    }
  }, [request, open]);

  const payload = useMemo(() => {
    if (!request) return {};
    const updated: Partial<Request> = {};
    if (formState.title !== request.title) updated.title = formState.title;
    if (formState.description !== request.description) updated.description = formState.description;
    if (formState.location !== request.location) updated.location = formState.location;
    if (formState.deadline && formState.deadline !== request.deadline?.slice(0, 16)) {
      updated.deadline = new Date(formState.deadline).toISOString();
    }
    if (formState.volunteer_number !== request.volunteer_number) {
      updated.volunteer_number = formState.volunteer_number;
    }
    if (formState.category !== request.category) {
      updated.category = formState.category;
    }
    if (formState.urgency_level !== request.urgency_level) {
      updated.urgency_level = formState.urgency_level;
    }
    return updated;
  }, [formState, request]);

  const handleChange =
    (field: keyof typeof formState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = field === 'volunteer_number' ? Number(event.target.value) : event.target.value;
        setFormState((prev) => ({ ...prev, [field]: value }));
      };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!request) return;
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    try {
      setSaving(true);
      setSubmitError(null);
      await onSubmit(payload);
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message ?? error?.message ?? 'Failed to update request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/40 rounded-2xl border-0 p-0 text-base w-full max-w-2xl m-auto overflow-hidden"
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-full max-h-[92vh] flex-col bg-white text-gray-900"
      >
        <header className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Update Request</h2>
        </header>

        <section className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Title <span className="sr-only">*</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.title}
                onChange={handleChange('title')}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Description
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.description}
                onChange={handleChange('description')}
                rows={4}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Category
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.category}
                onChange={handleChange('category')}
              >

                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Urgency
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.urgency_level}
                onChange={handleChange('urgency_level')}
              >
                {Object.entries(urgencyLevels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Location
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.location}
                onChange={handleChange('location')}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Deadline
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.deadline}
                onChange={handleChange('deadline')}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Volunteers Needed
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.volunteer_number}
                onChange={handleChange('volunteer_number')}
              />
            </label>
          </div>
        </section>

        <footer className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </footer>
      </form>
    </dialog>
  );
};

export default EditRequestModal;