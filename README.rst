================
electron-spotify
================

Desktop app / integration for `Spotify <http://www.spotify.com>`_ web client implemented with `Electron <http://electron.atom.io/>`_.

Install
=======

Electron
~~~~~~~~

On buntu these packages suffice::

  sudo apt-get install npm nodejs nodejs-legacy

You probably need to do more than this... but here goes::

  echo "prefix = ${HOME}/.local" > $HOME/.npmrc
  npm install -g electron-prebuilt
  
  Add: "$HOME/.local/bin" to your $PATH.

electron-spotify
~~~~~~~~~~~~~~~~

Grab the source and run::

  git clone https://github.com/safl/electron-spotify
  electron electron-spotify/app --ppapi-flash-path=${PPAPI_FLASH_PATH} --ppapi-flash-version=${PPAPI_FLASH_VERSION}

Replace ``${PPAPI_FLASH_PATH}`` and ``${PPAPI_FLASH_VERSION}`` with the path and version of your `Pepperflash <https://github.com/atom/electron/blob/master/docs/tutorial/using-pepper-flash-plugin.md>`_ plugin. Open ``chrome://plugins`` with Chrome, click ``+ Details``, then you can see the path and version of the currently installed PepperFlash.

Third Party
===========

Icons made by `Freepik <http://www.freepik.com>`_ from `Flaticon <http://www.flaticon.com>`_ licensed by `Creative Commons BY 3.0 <http://creativecommons.org/licenses/by/3.0/>`_

Related work
============

If this is of interest to you, then these might also peak your interest.

 * `Spotify-Electron <https://github.com/GyozaGuy/Spotify-Electron>`_
 * `core-app <https://github.com/natael/core-app>`_
 * `Nuvola Player <https://tiliado.eu/nuvolaplayer/>`_
 * `Electron Quick Start <https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md>`_
