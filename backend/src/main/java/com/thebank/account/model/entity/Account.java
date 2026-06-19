package com.thebank.account.model.entity;

import com.thebank.account.model.enums.Currency;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {
	@Id
	private UUID id;

	@Column(nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Currency currency;

	@Column(nullable = false, precision = 19, scale = 4)
	private BigDecimal balance;

	@Column(nullable = false)
	private String owner;

	@Column(nullable = false, unique = true)
	private String cardNumber;

	public Account() {}

	public Account(UUID id, String name, Currency currency, BigDecimal balance, String owner, String cardNumber) {
		this.id = id;
		this.name = name;
		this.currency = currency;
		this.balance = balance;
		this.owner = owner;
		this.cardNumber = cardNumber;
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Currency getCurrency() {
		return currency;
	}

	public void setCurrency(Currency currency) {
		this.currency = currency;
	}

	public BigDecimal getBalance() {
		return balance;
	}

	public void setBalance(BigDecimal balance) {
		this.balance = balance;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwner(String owner) {
		this.owner = owner;
	}

	public String getCardNumber() {
		return cardNumber;
	}

	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}
}
