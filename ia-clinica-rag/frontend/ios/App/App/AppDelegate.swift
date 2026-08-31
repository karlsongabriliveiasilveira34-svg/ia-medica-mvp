import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_: UIApplication, didFinishLaunchingWithOptions _: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers.
    }

    func applicationWillEnterForeground(_: UIApplication) {
        // Called as part of the transition from the background to the active state.
    }

    func applicationDidBecomeActive(_: UIApplication) {
        // Restart any tasks that were paused while the application was inactive.
    }

    func applicationWillTerminate(_: UIApplication) {
        // Called when the application is about to terminate.
    }

    func application(_: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options _: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
