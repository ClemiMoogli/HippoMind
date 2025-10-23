/**
 * Top toolbar component
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMindMapStore } from '../store/mindmap.store';
import { useUIStore } from '../store/ui.store';
import { useTabsStore } from '../store/tabs.store';
import { useFileOperations } from '../hooks/useFileOperations';

export function Toolbar() {
  const { t } = useTranslation();
  const { createNew, open, save } = useFileOperations();
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const canUndo = useMindMapStore((state) => state.canUndo());
  const canRedo = useMindMapStore((state) => state.canRedo());
  const undo = useMindMapStore((state) => state.undo);
  const redo = useMindMapStore((state) => state.redo);
  const activeTab = useTabsStore((state) => state.getActiveTab());

  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const themes: Array<'light' | 'dark' | 'sepia' | 'slate'> = ['light', 'dark', 'sepia', 'slate'];

  // Export to PDF
  const handleExportPDF = async () => {
    if (!activeTab) {
      alert('Aucune carte active à exporter.');
      return;
    }

    try {
      setExportStatus('Exportation en cours...');
      console.log('Starting PDF export for active tab...');

      const jsPDF = (await import('jspdf')).default;

      // Get the stage ref from the store
      const stageRef = useMindMapStore.getState().stageRef;
      if (!stageRef || !stageRef.current) {
        console.error('Stage ref not available');
        setExportStatus(null);
        alert('Impossible d\'exporter le PDF. Le canvas n\'est pas prêt.');
        return;
      }

      const stage = stageRef.current;
      console.log('Stage found:', stage);

      // Export stage to data URL using Konva's native method
      const dataURL = stage.toDataURL({
        pixelRatio: 2, // Higher quality
        mimeType: 'image/png',
      });

      // Get stage dimensions
      const width = stage.width();
      const height = stage.height();

      console.log(`Stage dimensions: ${width}x${height}`);

      // Create PDF with appropriate orientation
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      });

      pdf.addImage(dataURL, 'PNG', 0, 0, width, height);

      // Use the active tab's title for filename
      const filename = activeTab.title || 'mindmap';
      const pdfFilename = `${filename}.pdf`;

      pdf.save(pdfFilename);
      console.log('PDF exported successfully');

      // Get the download folder path (typically ~/Downloads on most systems)
      const downloadPath = `Téléchargements/${pdfFilename}`;
      setExportStatus(`✓ PDF exporté : ${downloadPath}`);
      setTimeout(() => setExportStatus(null), 5000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportStatus(null);
      alert(`Erreur lors de l'export PDF: ${error}`);
    }
  };

  // Handle save with notification
  const handleSave = async () => {
    console.log('[Toolbar] handleSave called');
    setSaveStatus('Sauvegarde en cours...');
    const success = await save();
    console.log('[Toolbar] save() returned:', success);

    if (success) {
      console.log('[Toolbar] Showing success notification');
      setSaveStatus('✓ Carte sauvegardée avec succès');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      console.log('[Toolbar] Save failed or was cancelled');
      // If save returned false but didn't throw, user probably cancelled
      setSaveStatus(null);
    }
  };

  return (
    <div className="toolbar">
      {/* Export status notification */}
      {exportStatus && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {exportStatus}
        </div>
      )}

      {/* Save status notification */}
      {saveStatus && (
        <div className={`fixed top-32 right-4 z-50 ${saveStatus.startsWith('✓') ? 'bg-green-500' : saveStatus.startsWith('✗') ? 'bg-red-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in`}>
          {saveStatus}
        </div>
      )}

      {/* File operations */}
      <button
        className="btn-icon"
        onClick={createNew}
        title="Créer une nouvelle carte mentale dans un nouvel onglet (Ctrl+N)"
        aria-label="Nouvelle carte"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      <button
        className="btn-icon"
        onClick={open}
        title="Ouvrir une carte mentale existante dans un nouvel onglet (Ctrl+O)"
        aria-label="Ouvrir"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      <button
        className="btn-icon"
        onClick={handleSave}
        title="Sauvegarder la carte mentale actuelle (Ctrl+S)"
        aria-label="Sauvegarder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
      </button>

      {/* Export PDF */}
      <button
        className="btn-icon"
        onClick={handleExportPDF}
        title="Exporter la carte actuelle en PDF dans le dossier Téléchargements"
        aria-label="Exporter en PDF"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

      {/* Undo/Redo */}
      <button
        className="btn-icon"
        onClick={undo}
        disabled={!canUndo}
        title="Annuler la dernière action (Ctrl+Z)"
        aria-label="Annuler"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>

      <button
        className="btn-icon"
        onClick={redo}
        disabled={!canRedo}
        title="Rétablir la dernière action annulée (Ctrl+Shift+Z)"
        aria-label="Rétablir"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Theme selector */}
      <div className="flex gap-1">
        {themes.map((themeName) => {
          const themeDescriptions: Record<string, string> = {
            light: 'Thème clair - Fond blanc moderne avec police Inter',
            dark: 'Thème sombre - Fond noir professionnel avec police Inter',
            sepia: 'Thème sépia - Tons chauds vintage avec police serif Lora',
            slate: 'Thème ardoise - Bleu-gris technique avec police monospace IBM Plex'
          };

          return (
            <button
              key={themeName}
              className={`btn-icon ${theme === themeName ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onClick={() => setTheme(themeName)}
              title={themeDescriptions[themeName]}
              aria-label={`Thème ${themeName}`}
            >
              <span className="text-xs capitalize">{t(`theme.${themeName}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
