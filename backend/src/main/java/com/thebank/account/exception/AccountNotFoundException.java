package com.thebank.account.exception;

import java.util.UUID;

public class AccountNotFoundException extends RuntimeException {
	public AccountNotFoundException(UUID accountId) {
		super("Account not found with ID: " + accountId);
	}
}
