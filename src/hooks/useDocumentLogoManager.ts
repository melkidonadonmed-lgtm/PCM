import React, { useState, useRef } from 'react';
import {
  WorkContext,
  LogoPosition,
  DocumentHeaderConfig,
  DocumentLogoConfig,
} from '../types';

export interface EditorConfirmDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
}

interface UseDocumentLogoManagerParams {
  activeContext: WorkContext | null;
  onSaveContext?: (updatedContext: WorkContext) => Promise<void>;
  headerConfig: DocumentHeaderConfig;
  sheetRef: React.RefObject<HTMLDivElement | null>;
  editor: { getJSON?: () => Record<string, unknown> | null; getHTML?: () => string } | null;
  triggerAutoSave: (
    editorInstance: { getJSON?: () => Record<string, unknown> | null; getHTML?: () => string } | null | undefined,
    updatedHeader?: DocumentHeaderConfig,
    updatedLogo?: DocumentLogoConfig
  ) => void;
  showToast: (msg: string) => void;
  setConfirmDialog: React.Dispatch<React.SetStateAction<EditorConfirmDialogState | null>>;
}

export function useDocumentLogoManager({
  activeContext,
  onSaveContext,
  headerConfig,
  sheetRef,
  editor,
  triggerAutoSave,
  showToast,
  setConfirmDialog,
}: UseDocumentLogoManagerParams) {
  const [logoConfig, setLogoConfig] = useState<DocumentLogoConfig>({
    dataUrl: activeContext?.logoDataUrl || undefined,
    position:
      activeContext?.logoAlignment === 'center'
        ? 'top-center'
        : activeContext?.logoAlignment === 'right'
        ? 'top-right'
        : 'top-left',
    x: 4,
    y: 3,
    size: 'md',
    visible: true,
    secondaryDataUrl: activeContext?.secondaryLogoDataUrl || undefined,
    secondaryPosition: 'header-right',
    secondarySize: 'md',
    secondaryVisible: true,
  });

  const [activeLogoTab, setActiveLogoTab] = useState<'left' | 'right'>('left');
  const [logoUploading, setLogoUploading] = useState(false);
  const [secondaryLogoUploading, setSecondaryLogoUploading] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const [logoSelected, setLogoSelected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);

  const MAX_RAW_LOGO_BYTES = 2 * 1024 * 1024; // 2 MiB bruto
  const MAX_SAFE_DATAURL_CHARS = 350_000; // ~260 KB binário para não exceder 1 MiB no Firestore

  const compressImageDataUrlIfNeeded = (rawDataUrl: string, mimeType: string): Promise<string> => {
    if (
      rawDataUrl.length <= MAX_SAFE_DATAURL_CHARS ||
      mimeType === 'image/svg+xml' ||
      typeof document === 'undefined'
    ) {
      return Promise.resolve(rawDataUrl);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 480;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/webp', 0.86);
        canvas.width = 0;
        canvas.height = 0;
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > MAX_RAW_LOGO_BYTES) {
      showToast('A imagem selecionada excede 2 MB. Escolha um logotipo mais leve.');
      return;
    }

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const dataUrl = await compressImageDataUrlIfNeeded(rawDataUrl, file.type);
      const updatedLogo: DocumentLogoConfig = {
        ...logoConfig,
        dataUrl,
        visible: true,
      };
      setLogoConfig(updatedLogo);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          logoDataUrl: dataUrl,
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
      setLogoUploading(false);
      setIsLogoMenuOpen(false);
      showToast('Logotipo adicionado com sucesso! Você pode movê-lo para onde quiser.');
    };
    reader.onerror = () => {
      setLogoUploading(false);
      showToast('Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPresetLogo = async (dataUrl: string, name: string) => {
    const updatedLogo: DocumentLogoConfig = {
      ...logoConfig,
      dataUrl,
      visible: true,
    };
    setLogoConfig(updatedLogo);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        logoDataUrl: dataUrl,
      });
    }
    if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
    setIsLogoMenuOpen(false);
    showToast(`Logotipo "${name}" aplicado!`);
  };

  const handleChangeLogoPosition = (position: LogoPosition) => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      position,
      visible: true,
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
    showToast(
      position === 'free'
        ? 'Modo Livre ativado: clique e arraste a logo para onde quiser na folha!'
        : 'Posição da logo alterada.'
    );
  };

  const handleChangeLogoSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      size,
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
  };

  const handleRemoveLogo = () => {
    setConfirmDialog({
      title: 'Remover Logotipo Esquerdo',
      description: 'Deseja remover o logotipo esquerdo deste documento?',
      confirmLabel: 'Remover Logotipo',
      variant: 'danger',
      onConfirm: async () => {
        const updated: DocumentLogoConfig = {
          ...logoConfig,
          dataUrl: undefined,
          visible: false,
        };
        setLogoConfig(updated);
        if (activeContext && onSaveContext) {
          await onSaveContext({
            ...activeContext,
            logoDataUrl: undefined,
          });
        }
        if (editor) triggerAutoSave(editor, headerConfig, updated);
        setConfirmDialog(null);
        showToast('Logotipo esquerdo removido.');
      },
    });
  };

  const handleSecondaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > MAX_RAW_LOGO_BYTES) {
      showToast('A imagem selecionada excede 2 MB. Escolha um logotipo mais leve.');
      return;
    }

    setSecondaryLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const dataUrl = await compressImageDataUrlIfNeeded(rawDataUrl, file.type);
      const updatedLogo: DocumentLogoConfig = {
        ...logoConfig,
        secondaryDataUrl: dataUrl,
        secondaryVisible: true,
        secondaryPosition: logoConfig.secondaryPosition || 'header-right',
        secondarySize: logoConfig.secondarySize || 'md',
      };
      setLogoConfig(updatedLogo);
      if (activeContext && onSaveContext) {
        await onSaveContext({
          ...activeContext,
          secondaryLogoDataUrl: dataUrl,
        });
      }
      if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
      setSecondaryLogoUploading(false);
      showToast('Logotipo direito aplicado com sucesso!');
    };
    reader.onerror = () => {
      setSecondaryLogoUploading(false);
      showToast('Falha ao processar o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplySecondaryPresetLogo = async (dataUrl: string, name: string) => {
    const updatedLogo: DocumentLogoConfig = {
      ...logoConfig,
      secondaryDataUrl: dataUrl,
      secondaryVisible: true,
      secondaryPosition: 'header-right',
      secondarySize: logoConfig.secondarySize || 'md',
    };
    setLogoConfig(updatedLogo);
    if (activeContext && onSaveContext) {
      await onSaveContext({
        ...activeContext,
        secondaryLogoDataUrl: dataUrl,
      });
    }
    if (editor) triggerAutoSave(editor, headerConfig, updatedLogo);
    showToast(`Logotipo direito "${name}" aplicado!`);
  };

  const handleChangeSecondaryLogoSize = (secondarySize: 'sm' | 'md' | 'lg' | 'xl') => {
    const updated: DocumentLogoConfig = {
      ...logoConfig,
      secondarySize,
    };
    setLogoConfig(updated);
    if (editor) triggerAutoSave(editor, headerConfig, updated);
  };

  const handleRemoveSecondaryLogo = () => {
    setConfirmDialog({
      title: 'Remover Logotipo Direito',
      description: 'Deseja remover o logotipo direito deste documento?',
      confirmLabel: 'Remover Logotipo',
      variant: 'danger',
      onConfirm: async () => {
        const updated: DocumentLogoConfig = {
          ...logoConfig,
          secondaryDataUrl: undefined,
          secondaryVisible: false,
        };
        setLogoConfig(updated);
        if (activeContext && onSaveContext) {
          await onSaveContext({
            ...activeContext,
            secondaryLogoDataUrl: undefined,
          });
        }
        if (editor) triggerAutoSave(editor, headerConfig, updated);
        setConfirmDialog(null);
        showToast('Logotipo direito removido.');
      },
    });
  };

  const handleLogoPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(true);
    setLogoSelected(true);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleLogoPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingLogo || !sheetRef.current) return;
    const rect = sheetRef.current.getBoundingClientRect();
    const x = Math.max(1, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(1, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    setLogoConfig((prev) => ({
      ...prev,
      position: 'free',
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    }));
  };

  const handleLogoPointerUp = (e: React.PointerEvent) => {
    if (isDraggingLogo) {
      setIsDraggingLogo(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      if (editor) triggerAutoSave(editor);
    }
  };

  return {
    logoConfig,
    setLogoConfig,
    activeLogoTab,
    setActiveLogoTab,
    logoUploading,
    secondaryLogoUploading,
    isLogoMenuOpen,
    setIsLogoMenuOpen,
    logoSelected,
    setLogoSelected,
    fileInputRef,
    secondaryFileInputRef,
    handleLogoUpload,
    handleApplyPresetLogo,
    handleChangeLogoPosition,
    handleChangeLogoSize,
    handleRemoveLogo,
    handleSecondaryLogoUpload,
    handleApplySecondaryPresetLogo,
    handleChangeSecondaryLogoSize,
    handleRemoveSecondaryLogo,
    handleLogoPointerDown,
    handleLogoPointerMove,
    handleLogoPointerUp,
  };
}
