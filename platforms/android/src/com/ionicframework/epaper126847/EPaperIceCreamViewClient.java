/*
 * @(#) EPaperIceCreamViewClient.java 1.0, 2015. 3. 17.
 * 
 * Copyright (c) 2014 Jong-Bok,Park  All rights reserved.
 */
 
package com.ionicframework.epaper126847;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.IceCreamCordovaWebViewClient;

import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

/**
 * @author Jong-Bok,Park (asdkf20@naver.com)
 * @version 1.0,  2015. 3. 17.
 * 
 */
public class EPaperIceCreamViewClient extends IceCreamCordovaWebViewClient {

	/**
	 * @param cordova
	 * @param view
	 */
	public EPaperIceCreamViewClient(CordovaInterface cordova,
			CordovaWebView view) {
		super(cordova, view);
	}
	
    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        handler.proceed();
    }	

}
