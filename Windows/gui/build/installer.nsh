; OpenClaw Installer — Windows 10 1809 (build 17763) minimum version guard
; This script is !included by electron-builder before the NSIS installer body.
; Use !macro customInit (called by electron-builder's own .onInit) instead of
; defining a standalone Function .onInit, which would conflict with the generated one.

!include "WinVer.nsh"

!macro customInit
  ; Require Windows 10 build 17763 (October 2018 Update / 1809) or later
  ${IfNot} ${AtLeastBuild} 17763
    MessageBox MB_OK|MB_ICONSTOP \
      "OpenClaw Installer requires Windows 10 version 1809 (October 2018 Update) or later.$\n$\nPlease update Windows and try again."
    Abort
  ${EndIf}
!macroend
