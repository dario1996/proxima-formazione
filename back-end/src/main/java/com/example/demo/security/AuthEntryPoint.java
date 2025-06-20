package com.example.demo.security;

import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;

import java.io.PrintWriter;

import org.springframework.security.core.AuthenticationException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.SneakyThrows;
import lombok.extern.java.Log;

@Log
public class AuthEntryPoint  extends BasicAuthenticationEntryPoint
{
	private static String REALM = "REAME";
	
	@Override
	@SneakyThrows
	public void commence(
			final HttpServletRequest request, 
			final HttpServletResponse response,
			final AuthenticationException authException) 
	{
		String ErrMsg = "Userid e/o Password non corrette!";
		
		log.warning("Errore Sicurezza: " + authException.getMessage());
		
		// Authentication failed, send error response.
		response.setContentType("application/json;charset=UTF-8");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.addHeader("WWW-Authenticate", "Basic realm=" + getRealmName() + "");
		

		PrintWriter writer = response.getWriter();
		writer.println(ErrMsg);
	}
	
	@Override
	public void afterPropertiesSet()
	{
		setRealmName(REALM);
		super.afterPropertiesSet();
	}
}
