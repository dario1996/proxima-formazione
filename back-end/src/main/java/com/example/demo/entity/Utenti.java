package com.example.demo.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utenti")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Utenti
{
	
	@Id
	@Column(name = "username")
	private String username;
	
	@Column(name = "email")
	private String email;
	
	@Column(name = "password")
	private String password;
	
	@Column(name = "cellulare")
	private String cellulare;
	
	@Column(name = "attivo")
	private String attivo = "Si";
	
	@Column(name = "flagprivacy")
	private String flagPrivacy = "Si";
	
	@Column(name = "ruoli")
	private List<String> ruoli;
	
}
