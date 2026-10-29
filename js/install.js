let installPrompt = null;

const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isLibraryVisible = () => Boolean($('.library'));

addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  if (isLibraryVisible()) showLibrary();
});

addEventListener('appinstalled', () => {
  installPrompt = null;
  toast('Installed. Open it from your home screen.');
  if (isLibraryVisible()) showLibrary();
});

function createInstallButton() {
  if (isInstalled() || (!installPrompt && !isIos())) return null;
  return el(
    'button',
    {
      class: 'button',
      onclick: async () => {
        if (!installPrompt) {
          openDialog('Add to Home Screen', el('small', {}, 'In Safari, tap the Share button, then choose Add to Home Screen.'));
          return;
        }
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        showLibrary();
      },
    },
    icon('download'),
    'Install app',
  );
}
