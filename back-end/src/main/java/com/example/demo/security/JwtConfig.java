package com.example.demo.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@ConfigurationProperties(prefix = "sicurezza")
@Data
public class JwtConfig
{
	private String uri;
	private String refresh;
	private String header;
	private String prefix;
	private int expiration;
	private String secret;
	private Boolean noexpiration;
}
