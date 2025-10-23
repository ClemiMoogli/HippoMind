/**
 * IPC channel definitions for secure communication
 * between main and renderer processes
 */
// IPC Channel names
export const IPC_CHANNELS = {
    // File operations
    FILE_NEW: 'file:new',
    FILE_OPEN_DIALOG: 'file:open-dialog',
    FILE_OPEN: 'file:open',
    FILE_SAVE_DIALOG: 'file:save-dialog',
    FILE_SAVE: 'file:save',
    FILE_SAVE_AS: 'file:save-as',
    FILE_CREATE_BACKUP: 'file:create-backup',
    // Export
    EXPORT_IMAGE: 'export:image',
    EXPORT_PDF: 'export:pdf',
    // Preferences
    PREFS_GET: 'prefs:get',
    PREFS_SET: 'prefs:set',
    // App
    APP_GET_VERSION: 'app:get-version',
    APP_GET_LOCALE: 'app:get-locale',
};
