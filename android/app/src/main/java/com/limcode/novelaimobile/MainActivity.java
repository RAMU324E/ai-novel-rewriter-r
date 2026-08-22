package com.limcode.novelaimobile;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeStreamPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
