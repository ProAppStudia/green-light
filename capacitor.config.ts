import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'green.light',
  appName: 'green-light',
  webDir: 'www',
  android: {
	  minSdkVersion: 26,
	  targetSdkVersion: 34
	},
	plugins: {
	  SplashScreen: {
		launchShowDuration: 2000,
		showSpinner: false,
		androidScaleType: "CENTER_CROP",
		splashFullScreen: true,
		splashImmersive: true
	  }
	}
};

export default config;
