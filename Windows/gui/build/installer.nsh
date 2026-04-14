; OpenClaw Installer — Windows 10 1809 (build 17763) minimum version guard
; This script is !included by electron-builder before the NSIS installer body.

!include "WinVer.nsh"
!include "MUI2.nsh"

Function .onInit
  ; Require Windows 10 build 17763 (October 2018 Update / 1809) or later
  ${IfNot} ${AtLeastBuild} 17763
    MessageBox MB_OK|MB_ICONSTOP \
      "OpenClaw Installer requires Windows 10 version 1809 (October 2018 Update) or later.$\n$\nPlease update Windows and try again."
    Abort
  ${EndIf}
FunctionEnd
