'use client';

import { useAddSourceForm } from './hooks/useAddSourceForm';
import { ModalBackdrop } from '@/components/ui/ModalBackdrop';
import { ModalHeader } from '@/components/ui/ModalHeader';
import type { VideoSource } from '@/lib/types';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: VideoSource) => void;
  existingIds: string[];
  initialValues?: VideoSource | null;
}

export function AddSourceModal({ isOpen, onClose, onAdd, existingIds, initialValues }: AddSourceModalProps) {
  const { name, setName, url, setUrl, error, handleSubmit } = useAddSourceForm({
    isOpen,
    existingIds,
    onAdd,
    onClose,
    initialValues,
  });

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop isOpen={isOpen} onClose={onClose} />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 z-[9999] w-[90%] max-w-md -translate-x-1/2 transition-all duration-300 ${isOpen
          ? 'opacity-100 -translate-y-1/2 scale-100'
          : 'opacity-0 -translate-y-[40%] scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)] p-6">
          <ModalHeader title={initialValues ? "编辑视频源" : "添加自定义源"} onClose={onClose} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="source-name" className="block mb-2 font-medium text-[var(--text-color)]">
                源名称
              </label>
              <input
                id="source-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：新视频源"
                className="w-full bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-[var(--radius-2xl)] px-4 py-3 text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)] focus:outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-[0.4s]"
              />
            </div>

            <div>
              <label htmlFor="source-url" className="block mb-2 font-medium text-[var(--text-color)]">
                接口地址
              </label>
              <input
                id="source-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api.php/provide/vod"
                className="w-full bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-[var(--radius-2xl)] px-4 py-3 text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)] focus:outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] transition-all duration-[0.4s]"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-[var(--radius-2xl)] px-4 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-semibold hover:bg-[color-mix(in_srgb,var(--text-color)_10%,transparent)] transition-all duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-sm)] transition-all duration-200"
              >
                {initialValues ? "保存" : "添加"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
