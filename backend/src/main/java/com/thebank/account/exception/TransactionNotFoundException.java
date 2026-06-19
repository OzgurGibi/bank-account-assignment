package com.thebank.account.exception;

import java.util.UUID;

public class TransactionNotFoundException extends RuntimeException {
	public TransactionNotFoundException(UUID txId) {
		super("Transaction not found with ID: " + txId);
	}
}
