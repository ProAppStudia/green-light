package green.light;

import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.util.DisplayMetrics;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Prevent system font scale from affecting WebView text
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().getSettings().setTextZoom(100);
        } 
    }

    @Override
    public Resources getResources() {
        Resources res = super.getResources();
        Configuration config = new Configuration(res.getConfiguration());
        // Lock font scale to default
        config.fontScale = 1.0f;
        // Lock display density to default (prevents "Display size" setting from enlarging layout)
        if (config.densityDpi > DisplayMetrics.DENSITY_DEVICE_STABLE) {
            //config.densityDpi = DisplayMetrics.DENSITY_DEVICE_STABLE; // нова правка
        }
        return createConfigurationContext(config).getResources();
    }
}