import AppKit
import ApplicationServices
import Carbon.HIToolbox
import Foundation

// MARK: - User configuration

// Customize `modifiers` with any combination of `.command`, `.control`, and `.option`.
// Change `key` to a case supported by `Key`, and keep each internal `id` unique.
private let maximizeHotKey = HotKeyDefinition(
    id: 1,
    modifiers: [.control, .option],
    key: .upArrow,
    action: "maximize"
)
private let nextDisplayHotKey = HotKeyDefinition(
    id: 2,
    modifiers: [.control, .option],
    key: .rightArrow,
    action: "move to next display"
)

// MARK: - Implementation

private struct HotKeyModifiers: OptionSet {
    let rawValue: UInt32

    // Carbon modifier constants are defined by HIToolbox/Events.h in the macOS SDK.
    static let command = HotKeyModifiers(rawValue: UInt32(cmdKey))
    static let control = HotKeyModifiers(rawValue: UInt32(controlKey))
    static let option = HotKeyModifiers(rawValue: UInt32(optionKey))

    var name: String {
        [
            contains(.command) ? "Cmd" : nil,
            contains(.control) ? "Ctrl" : nil,
            contains(.option) ? "Option" : nil,
        ].compactMap { $0 }.joined(separator: "+")
    }
}

private enum Key {
    case upArrow
    case rightArrow

    // Carbon virtual-key constants are defined by HIToolbox/Events.h in the macOS SDK.
    var code: UInt32 {
        switch self {
        case .upArrow: UInt32(kVK_UpArrow)
        case .rightArrow: UInt32(kVK_RightArrow)
        }
    }

    var name: String {
        switch self {
        case .upArrow: "Up"
        case .rightArrow: "Right"
        }
    }
}

private struct HotKeyDefinition {
    let id: UInt32
    let modifiers: HotKeyModifiers
    let key: Key
    let action: String

    var description: String {
        "\([modifiers.name, key.name].filter { !$0.isEmpty }.joined(separator: "+")): \(action)"
    }
}

private let hotKeySignature: OSType = 0x484F4453 // HODS

private func copyAttribute(_ element: AXUIElement, _ attribute: CFString) -> CFTypeRef? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, attribute, &value) == .success else {
        return nil
    }
    return value
}

// The system-wide element exposes the focused application, whose focused-window
// attribute is another AXUIElement: https://developer.apple.com/documentation/applicationservices/axuielement
private func focusedWindow() -> AXUIElement? {
    let system = AXUIElementCreateSystemWide()
    guard let application = copyAttribute(system, kAXFocusedApplicationAttribute as CFString) else {
        return nil
    }
    return copyAttribute(
        application as! AXUIElement,
        kAXFocusedWindowAttribute as CFString
    ) as! AXUIElement?
}

// AX position and size attributes carry CGPoint/CGSize values wrapped in AXValue:
// https://developer.apple.com/documentation/applicationservices/axvalue
private func frame(of window: AXUIElement) -> CGRect? {
    guard
        let positionValue = copyAttribute(window, kAXPositionAttribute as CFString) as! AXValue?,
        let sizeValue = copyAttribute(window, kAXSizeAttribute as CFString) as! AXValue?
    else {
        return nil
    }

    var position = CGPoint.zero
    var size = CGSize.zero
    guard
        AXValueGetValue(positionValue, .cgPoint, &position),
        AXValueGetValue(sizeValue, .cgSize, &size)
    else {
        return nil
    }
    return CGRect(origin: position, size: size)
}

@discardableResult
private func setFrame(_ frame: CGRect, of window: AXUIElement) -> Bool {
    var position = frame.origin
    var size = frame.size
    guard
        let positionValue = AXValueCreate(.cgPoint, &position),
        let sizeValue = AXValueCreate(.cgSize, &size)
    else {
        return false
    }

    // Setting position again handles applications that constrain size against the old display.
    let positionResult = AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, positionValue)
    let sizeResult = AXUIElementSetAttributeValue(window, kAXSizeAttribute as CFString, sizeValue)
    let finalPositionResult = AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, positionValue)
    return positionResult == .success && sizeResult == .success && finalPositionResult == .success
}

private extension CGRect {
    // Coordinate conversion adapted from Rectangle's `screenFlipped` (MIT):
    // https://github.com/rxhanson/Rectangle/blob/5e4a13569301d35beb72f4ff7c5e67e9cd289f4b/Rectangle/Utilities/CGExtension.swift#L11-L17
    var screenFlipped: CGRect {
        guard let primaryScreen = NSScreen.screens.first else { return self }
        return CGRect(
            x: origin.x,
            y: primaryScreen.frame.maxY - maxY,
            width: width,
            height: height
        )
    }

    func approximatelyEquals(_ other: CGRect, tolerance: CGFloat = 4) -> Bool {
        abs(minX - other.minX) <= tolerance
            && abs(minY - other.minY) <= tolerance
            && abs(width - other.width) <= tolerance
            && abs(height - other.height) <= tolerance
    }
}

private func screen(containing windowFrame: CGRect) -> NSScreen? {
    let appKitFrame = windowFrame.screenFlipped
    // Rectangle also assigns a window to the display with the largest overlap:
    // https://github.com/rxhanson/Rectangle/blob/5e4a13569301d35beb72f4ff7c5e67e9cd289f4b/Rectangle/ScreenDetection.swift#L48-L64
    return NSScreen.screens.max { lhs, rhs in
        lhs.frame.intersection(appKitFrame).area < rhs.frame.intersection(appKitFrame).area
    }
}

private extension CGRect {
    var area: CGFloat {
        isNull ? 0 : width * height
    }
}

private final class DesktopController {
    private var eventHandler: EventHandlerRef?
    private var registeredHotKeys: [EventHotKeyRef?] = []

    func start() throws {
        var eventType = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: UInt32(kEventHotKeyPressed)
        )
        // Carbon delivers registered global hotkeys through the application event target,
        // without a keyboard event tap: https://developer.apple.com/documentation/carbon/1546869-registereventhotkey
        let handlerStatus = InstallEventHandler(
            GetApplicationEventTarget(),
            { _, event, userData in
                guard let event, let userData else { return OSStatus(eventNotHandledErr) }
                let controller = Unmanaged<DesktopController>
                    .fromOpaque(userData)
                    .takeUnretainedValue()
                return controller.handle(event)
            },
            1,
            &eventType,
            Unmanaged.passUnretained(self).toOpaque(),
            &eventHandler
        )
        guard handlerStatus == noErr else {
            throw RuntimeError("failed to install hotkey event handler (OSStatus \(handlerStatus))")
        }

        try registerHotKey(maximizeHotKey)
        try registerHotKey(nextDisplayHotKey)
        print("ho-desktop running")
        print("  \(maximizeHotKey.description)")
        print("  \(nextDisplayHotKey.description)")
    }

    private func registerHotKey(_ definition: HotKeyDefinition) throws {
        var hotKey: EventHotKeyRef?
        let status = RegisterEventHotKey(
            definition.key.code,
            definition.modifiers.rawValue,
            EventHotKeyID(signature: hotKeySignature, id: definition.id),
            GetApplicationEventTarget(),
            0,
            &hotKey
        )
        guard status == noErr else {
            throw RuntimeError("failed to register hotkey \(definition.id) (OSStatus \(status))")
        }
        registeredHotKeys.append(hotKey)
    }

    private func handle(_ event: EventRef) -> OSStatus {
        var hotKeyID = EventHotKeyID()
        // A kEventHotKeyPressed event stores its EventHotKeyID as the direct-object parameter:
        // https://developer.apple.com/documentation/carbon/1534713-geteventparameter
        let status = GetEventParameter(
            event,
            EventParamName(kEventParamDirectObject),
            EventParamType(typeEventHotKeyID),
            nil,
            MemoryLayout<EventHotKeyID>.size,
            nil,
            &hotKeyID
        )
        guard status == noErr, hotKeyID.signature == hotKeySignature else { return status }

        switch hotKeyID.id {
        case maximizeHotKey.id:
            maximizeFocusedWindow()
        case nextDisplayHotKey.id:
            moveFocusedWindowToNextDisplay()
        default:
            return OSStatus(eventNotHandledErr)
        }
        return noErr
    }

    private func maximizeFocusedWindow() {
        guard
            let window = focusedWindow(),
            let windowFrame = frame(of: window),
            let screen = screen(containing: windowFrame)
        else {
            logError("cannot resolve the focused window")
            return
        }
        if !setFrame(screen.visibleFrame.screenFlipped, of: window) {
            logError("the focused window rejected the maximize operation")
        }
    }

    private func moveFocusedWindowToNextDisplay() {
        // Rectangle derives adjacent displays from a spatially ordered screen list:
        // https://github.com/rxhanson/Rectangle/blob/5e4a13569301d35beb72f4ff7c5e67e9cd289f4b/Rectangle/ScreenDetection.swift#L76-L123
        let screens = NSScreen.screens.sorted { $0.frame.midX < $1.frame.midX }
        guard screens.count > 1 else { return }
        guard
            let window = focusedWindow(),
            let windowFrame = frame(of: window),
            let currentScreen = screen(containing: windowFrame),
            let currentIndex = screens.firstIndex(of: currentScreen)
        else {
            logError("cannot resolve the focused window")
            return
        }

        let destination = screens[(currentIndex + 1) % screens.count]
        let currentVisibleFrame = currentScreen.visibleFrame.screenFlipped
        let destinationFrame = destination.visibleFrame.screenFlipped
        var targetFrame: CGRect

        if windowFrame.approximatelyEquals(currentVisibleFrame) {
            targetFrame = destinationFrame
        } else {
            let width = min(windowFrame.width, destinationFrame.width)
            let height = min(windowFrame.height, destinationFrame.height)
            targetFrame = CGRect(
                x: destinationFrame.midX - width / 2,
                y: destinationFrame.midY - height / 2,
                width: width,
                height: height
            )
        }

        if !setFrame(targetFrame, of: window) {
            logError("the focused window rejected the move operation")
        }
    }
}

private struct RuntimeError: Error, CustomStringConvertible {
    let description: String
    init(_ description: String) { self.description = description }
}

private func logError(_ message: String) {
    FileHandle.standardError.write(Data("ho-desktop: \(message)\n".utf8))
}

private func printCheck() -> Bool {
    let trusted = AXIsProcessTrusted()
    print("Accessibility: \(trusted ? "granted" : "not granted")")
    print("Displays: \(NSScreen.screens.count)")
    for (index, screen) in NSScreen.screens.enumerated() {
        print("  \(index + 1): frame=\(screen.frame) visible=\(screen.visibleFrame)")
    }

    if trusted, let window = focusedWindow(), let windowFrame = frame(of: window) {
        print("Focused window: \(windowFrame)")
    } else if trusted {
        print("Focused window: unavailable")
    }
    return trusted
}

let arguments = Set(CommandLine.arguments.dropFirst())
if arguments.contains("--help") {
    print("Usage: ho-desktop [--check | --request-permission]")
    exit(EXIT_SUCCESS)
}
if arguments.contains("--check") {
    exit(printCheck() ? EXIT_SUCCESS : EXIT_FAILURE)
}
if arguments.contains("--request-permission") {
    let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue(): true] as CFDictionary
    exit(AXIsProcessTrustedWithOptions(options) ? EXIT_SUCCESS : EXIT_FAILURE)
}

let promptOptions = [kAXTrustedCheckOptionPrompt.takeUnretainedValue(): true] as CFDictionary
guard AXIsProcessTrustedWithOptions(promptOptions) else {
    logError("Accessibility permission is required; grant it in System Settings and restart")
    exit(EXIT_FAILURE)
}

do {
    let controller = DesktopController()
    try controller.start()
    RunLoop.main.run()
} catch {
    logError(String(describing: error))
    exit(EXIT_FAILURE)
}
