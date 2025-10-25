/**
 * Welcome screen component shown on app startup
 */

import { useState, useEffect } from 'react';
import { useTabsStore } from '../store/tabs.store';
import { createDefaultDocument } from '../utils/createDefaultDocument';
import type { MindMapDocument } from '@shared';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const addTab = useTabsStore((state) => state.addTab);

  useEffect(() => {
    console.log('WelcomeScreen mounted');
    console.log('electronAPI available:', !!window.electronAPI);
    setIsLoading(false);
  }, []);

  const handleNewMap = () => {
    // Create a new document and add it as a tab
    const newDoc = createDefaultDocument();
    addTab(newDoc);
    onClose();
  };

  const handleOpenMap = async () => {
    try {
      console.log('Opening file dialog...');
      if (!window.electronAPI) {
        alert('L\'API n\'est pas disponible. Veuillez réessayer.');
        return;
      }

      const fileDialogResult = await window.electronAPI.fileOpenDialog();
      console.log('File dialog result:', fileDialogResult);

      // Support both Electron (filePath) and Tauri (file_path) conventions
      const filePath = fileDialogResult.filePath || fileDialogResult.file_path;
      if (fileDialogResult && !fileDialogResult.canceled && filePath) {
        const result = await window.electronAPI.fileOpen(filePath);
        console.log('File open result:', result);

        if (result && result.success && result.data) {
          // Add the opened document as a new tab
          addTab(result.data, result.filePath || filePath);
          onClose();
        } else if (result && result.error) {
          alert('Erreur: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      alert('Erreur lors de l\'ouverture du fichier: ' + (error as Error).message);
    }
  };

  const handleTutorial = () => {
    setShowTutorial(true);
  };

  const handleBackFromTutorial = () => {
    setShowTutorial(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HippoMind
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showTutorial) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackFromTutorial}
              className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ← Retour
            </button>

            <h1 className="text-4xl font-bold mb-8">Tutoriel - Guide d'utilisation</h1>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Bienvenue dans HippoMind!</h2>
              <p className="text-lg mb-4">
                HippoMind est un outil puissant pour créer des cartes mentales interactives.
                Ce tutoriel vous guidera à travers les fonctionnalités principales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Créer et gérer des nœuds</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Ajouter un nœud enfant</strong>: Double-cliquez sur un nœud ou utilisez le bouton "Ajouter enfant" dans la barre d'outils</li>
                <li><strong>Modifier un nœud</strong>: Cliquez sur un nœud pour le sélectionner, puis modifiez le texte dans le panneau de propriétés</li>
                <li><strong>Déplacer un nœud</strong>: Cliquez et faites glisser un nœud pour le repositionner</li>
                <li><strong>Supprimer un nœud</strong>: Sélectionnez un nœud et appuyez sur la touche Suppr ou utilisez le bouton de suppression</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Personnalisation</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Couleurs</strong>: Changez la couleur de fond et de bordure des nœuds dans le panneau de propriétés</li>
                <li><strong>Formes</strong>: Choisissez parmi différentes formes (rectangle, cercle, ellipse, etc.)</li>
                <li><strong>Styles de connexion</strong>: Personnalisez l'apparence des liens entre les nœuds</li>
                <li><strong>Thèmes</strong>: Basculez entre le mode clair et sombre</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Pièces jointes</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Ajouter une image</strong>: Utilisez la palette d'outils pour ajouter des images au canvas</li>
                <li><strong>Ajouter du texte libre</strong>: Ajoutez des zones de texte indépendantes pour des annotations</li>
                <li><strong>Repositionner</strong>: Déplacez les pièces jointes en les faisant glisser</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Navigation et vue</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Zoom</strong>: Utilisez la molette de la souris ou les boutons +/- dans la barre d'outils</li>
                <li><strong>Déplacement</strong>: Maintenez la touche Espace et faites glisser pour déplacer la vue</li>
                <li><strong>Centrer</strong>: Utilisez le bouton "Centrer" pour recentrer sur le nœud racine</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Raccourcis clavier</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Ctrl/Cmd + N</strong>: Nouveau document</li>
                <li><strong>Ctrl/Cmd + O</strong>: Ouvrir un document</li>
                <li><strong>Ctrl/Cmd + S</strong>: Sauvegarder</li>
                <li><strong>Ctrl/Cmd + Z</strong>: Annuler</li>
                <li><strong>Ctrl/Cmd + Shift + Z</strong>: Rétablir</li>
                <li><strong>Suppr</strong>: Supprimer le nœud sélectionné</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Sauvegarde et export</h2>
              <ul className="list-disc list-inside space-y-2 text-lg ml-4">
                <li><strong>Sauvegarde automatique</strong>: Vos modifications sont automatiquement sauvegardées</li>
                <li><strong>Exporter en PNG</strong>: Exportez votre carte mentale comme image</li>
                <li><strong>Exporter en PDF</strong>: Créez un document PDF de votre carte</li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Astuce</h3>
              <p className="text-lg">
                N'hésitez pas à expérimenter! Vous pouvez toujours annuler vos actions avec Ctrl/Cmd + Z.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HippoMind
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Créez des cartes mentales interactives et organisez vos idées
          </p>
        </div>

        <div className="grid gap-6">
          <button
            onClick={handleNewMap}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-8 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Nouvelle carte</h2>
                <p className="text-blue-100">Commencez avec une carte vierge</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          <button
            onClick={handleOpenMap}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-8 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Ouvrir une carte</h2>
                <p className="text-purple-100">Continuez à travailler sur un projet existant</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
          </button>

          <button
            onClick={handleTutorial}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-8 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Tutoriel / Mode d'emploi</h2>
                <p className="text-green-100">Apprenez à utiliser toutes les fonctionnalités</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Astuce: Vous pouvez toujours créer une nouvelle carte ou ouvrir un fichier via le menu Fichier</p>
        </div>
      </div>
    </div>
  );
}
