# Windows Drivers

After a clean Microsoft ISO install, run Windows Update first, then check the laptop OEM support page.

Prioritize:

1. BIOS or firmware
2. Chipset
3. Graphics
4. WiFi and Bluetooth
5. Audio

For Dell laptops, use Dell's support page or SupportAssist only long enough to identify recommended drivers. Avoid keeping unnecessary OEM background software if it causes performance or audio issues.

Check installed drivers:

```powershell
Get-WmiObject Win32_PnPSignedDriver |
  Select DeviceName, DriverVersion, DriverDate, Manufacturer |
  Sort DeviceName
```
