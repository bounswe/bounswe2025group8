// ...existing code...
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../features/category/services/categoryService';
import { urgencyLevels, getUrgencyLevelName } from "../constants/urgency_level";
import { getCategoryName } from '../constants/categories';
import { useTheme } from '../hooks/useTheme';

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
  const { t } = useTranslation();
  const { colors } = useTheme();
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

  // Add backdrop styling based on theme
  useEffect(() => {
    const styleId = 'edit-request-modal-backdrop-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      dialog#edit-request-modal::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
      }
    `;

    return () => {
      // Cleanup on unmount
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [colors]);

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
    } catch (error: unknown) {
      // Try to extract a meaningful message safely without using `any`
      let message = t('editRequestModal.failedToUpdate');
      if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as { message?: string }).message;
        if (maybeMessage) message = maybeMessage;
        const maybeResponse = (error as { response?: { data?: { message?: string; error?: string; errors?: Record<string, string[]> } } }).response;
        if (maybeResponse?.data?.message) message = maybeResponse.data.message;
        else if (maybeResponse?.data?.error) message = maybeResponse.data.error;
        else if (maybeResponse?.data?.errors) {
          const combined = Object.values(maybeResponse.data.errors).flat().join(', ');
          if (combined) message = combined;
        }
      }
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      id="edit-request-modal"
      ref={dialogRef}
      style={{
        backgroundColor: colors.background.secondary,
        color: colors.text.primary,
        borderRadius: '16px',
        border: 'none',
        padding: 0,
        fontSize: '16px',
        width: '100%',
        maxWidth: '42rem',
        margin: 'auto',
        overflow: 'hidden',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-request-title"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '92vh',
          backgroundColor: colors.background.secondary,
          color: colors.text.primary,
        }}
      >
        <header style={{
          borderBottom: `1px solid ${colors.border.primary}`,
          padding: '16px 24px',
        }}>
          <h2 id="edit-request-title" style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            margin: 0,
          }}>{t('editRequestModal.title')}</h2>
        </header>

        <section style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {submitError && (
              <div style={{
                borderRadius: '8px',
                border: `1px solid ${colors.semantic.error}`,
                backgroundColor: `${colors.semantic.error}20`,
                padding: '12px 16px',
                fontSize: '14px',
                color: colors.semantic.error,
              }} role="alert" aria-live="assertive">
                {submitError}
              </div>
            )}

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.titleLabel')} <span className="sr-only">*</span>
              <input
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.title}
                onChange={handleChange('title')}
                required
              />
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.descriptionLabel')}
              <textarea
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                  resize: 'vertical',
                }}
                value={formState.description}
                onChange={handleChange('description')}
                rows={4}
              />
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.categoryLabel')}
              <select
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.category}
                onChange={handleChange('category')}
                aria-label={t('editRequestModal.categoryLabel')}
              >

                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {getCategoryName(category.value, t)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.urgencyLabel')}
              <select
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.urgency_level}
                onChange={handleChange('urgency_level')}
                aria-label={t('editRequestModal.urgencyLabel')}
              >
                {Object.entries(urgencyLevels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {getUrgencyLevelName(Number(key), t)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.locationLabel')}
              <input
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.location}
                onChange={handleChange('location')}
                aria-label={t('editRequestModal.locationLabel')}
              />
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.deadlineLabel')}
              <input
                type="datetime-local"
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.deadline}
                onChange={handleChange('deadline')}
                aria-label={t('editRequestModal.deadlineLabel')}
              />
            </label>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
            }}>
              {t('editRequestModal.volunteersNeeded')}
              <input
                type="number"
                min={1}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border.primary}`,
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                }}
                value={formState.volunteer_number}
                onChange={handleChange('volunteer_number')}
                aria-label={t('editRequestModal.volunteersNeeded')}
              />
            </label>
          </div>
        </section>

        <footer style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: `1px solid ${colors.border.primary}`,
          padding: '16px 24px',
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              borderRadius: '8px',
              border: `1px solid ${colors.border.primary}`,
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.primary,
              backgroundColor: colors.background.elevated,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              borderRadius: '8px',
              backgroundColor: colors.brand.primary,
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? t('editRequestModal.saving') : t('saveChanges')}
          </button>
        </footer>
      </form>
    </dialog>
  );
};

export default EditRequestModal;